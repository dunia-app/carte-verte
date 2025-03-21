import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { BaasAddress } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import {
  ArgumentOutOfRangeException,
  NotFoundException,
} from '../../../../libs/exceptions/index'
import { EmployeeRepositoryPort } from '../../../organization/database/employee/employee.repository.port'
import { OrganizationRepositoryPort } from '../../../organization/database/organization/organization.repository.port'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { PinCode } from '../../domain/value-objects/pin-code.value-object'
import { CardPinFormatNotCorrectError } from '../../errors/card.errors'
import { ConvertToPhysicalCardCommand } from './convert-to-physical-card.command'

export async function convertToPhysicalCard(
  command: ConvertToPhysicalCardCommand,
  unitOfWork: UnitOfWork,
  redis: RedisService,
  baas: Baas,
  config: ConfigService,
): Promise<Result<boolean, TokenExpiredError | NotFoundException>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )
  const organizationRepo: OrganizationRepositoryPort =
    unitOfWork.getOrganizationRepository(command.correlationId)

  const card = await cardRepo.findOneByIdOrThrow(command.cardId)
  const employee = await employeeRepo.findOneByIdOrThrow(card.employeeId)
  const organization = await organizationRepo.findOneByIdOrThrow(
    employee.organizationId,
  )

  const cacheResult = await redis.persist.get(
    `initiateCardConversion:${card.id.value}`,
  )
  if (!cacheResult) {
    logger.error(
      `convertToPhysicalCard: unable to find address to convert card to physical : ${card.id.value}`,
    )
    return Result.err(new TokenExpiredError())
  }
  const physicalCardInfo: {
    newPin: string
    confirmPin: string
    street: string
    street2: string
    street3: string
    city: string
    postalCode: string
  } = JSON.parse(cacheResult)

  const baasAddress: BaasAddress = {
    city: physicalCardInfo.city,
    postalCode: physicalCardInfo.postalCode,
    street: physicalCardInfo.street,
    street2: physicalCardInfo.street2,
    street3: physicalCardInfo.street3,
  }

  const requestPhysicalRes = card.confirmPhysical(
    new Address({
      ...baasAddress,
    }),
  )
  if (requestPhysicalRes.isErr) {
    return Result.err(requestPhysicalRes.error)
  }
  // First SetPin
  try {
    const res = card.setPin(
      new PinCode(physicalCardInfo.newPin, physicalCardInfo.confirmPin),
    )
    if (res.isErr) {
      return Result.err(res.error)
    }
  } catch (e) {
    if (e instanceof ArgumentOutOfRangeException) {
      return Result.err(new CardPinFormatNotCorrectError(e))
    }
  }
  // As we set a default pin at card creation
  // if user has not entered a pin yet we need to update it from the default one
  const result = await baas.changePin(
    card.externalId,
    physicalCardInfo.newPin,
    physicalCardInfo.confirmPin,
  )
  if (result.isErr) {
    return Result.err(result.error)
  }
  //

  // Second deactivate nfc before creating physical card for security
  // We will reactivate it when card is received and activated
  const nfcRes = await baas.deactivateNfcOption(card.externalId)
  if (nfcRes.isErr) {
    return Result.err(nfcRes.error)
  }

  // And finally command physical card if not on staging
  if (!config.isDebug()) {
    const baasRes = await baas.requestPhysicalCard(
      card.externalId,
      employee.externalEmployeeId!,
      baasAddress,
    )
    if (baasRes.isErr) {
      return Result.err(baasRes.error)
    }
  }

  await cardRepo.save(card)
  await redis.persist.del(`initiateCardConversion:${card.id.value}`)
  return Result.ok(true)
}
