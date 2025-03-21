import { logger } from '../../../../helpers/application.helper'
import { now } from '../../../../helpers/date.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { CardAcquisitionPayinEntity } from '../../domain/entities/card-acquisition-payin.entity'
import { CancelCardAcquisitionPayinCommand } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.command'
import { cancelCardAcquisitionPayin } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.service'
import { UpdateCardAcquisitionOverdraftCommand } from './update-card-acquisition-overdraft.command'

export async function updateCardAcquisitionOverdraft(
  command: UpdateCardAcquisitionOverdraftCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionRepo: CardAcquisitionRepositoryPort =
    unitOfWork.getCardAcquisitionRepository(command.correlationId)
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const time = now()
  const [cardAcquisition, employeeWithInfo] = await Promise.all([
    cardAcquisitionRepo.findOneActiveByEmployeeIdOrThrow(command.employeeId),
    unitOfWork
      .getEmployeeRepository(command.correlationId)
      .findOneWithInfoByIdOrThrow(command.employeeId),
  ])
  const payin =
    await cardAcquisitionPayinRepo.findOneActiveByExternalCardAcquisitionId(
      cardAcquisition.externalId,
    )
  const afterDbCalls = now()
  logger.log(
    `[updateCardAcquisitionOverdraft]: our db calls: ${afterDbCalls - time}`,
  )
  if (payin) {
    try {
      // Cancel the existing one
      const cancelCommand = new CancelCardAcquisitionPayinCommand({
        correlationId: command.correlationId,
        employeeId: payin.employeeId,
      })
      await cancelCardAcquisitionPayin(
        cancelCommand,
        unitOfWork,
        baas,
        cardAcquisitionService,
      )
    } catch (e) {
      logger.warn(`[renewCardAcquisitionPayin]: ${payin.employeeId} ${e}`)
    }
  }
  const afterCancelCall = now()
  logger.log(
    `[updateCardAcquisitionOverdraft]: cancel calls: ${
      afterCancelCall - afterDbCalls
    }`,
  )

  const aftercardToken = now()
  logger.log(
    `[updateCardAcquisitionOverdraft]: cancel calls: ${
      aftercardToken - afterCancelCall
    }`,
  )

  // Create a new one with the right amount
  const authorizedPayin = await baas.authorizePayin(
    command.overdraftLimit,
    cardAcquisition.paymentProduct,
    cardAcquisition.baasId,
    employeeWithInfo.firstname,
    employeeWithInfo.lastname,
    employeeWithInfo.email,
    new Address({
      city: employeeWithInfo.city ? employeeWithInfo.city : 'Paris',
      postalCode: employeeWithInfo.postalCode,
      street: employeeWithInfo.street,
    }),
    employeeWithInfo.firstname + ' ' + employeeWithInfo.lastname,
  )
  const afterAuthorizeCall = now()
  logger.log(
    `[updateCardAcquisitionOverdraft]: authorize calls: ${
      afterAuthorizeCall - aftercardToken
    }`,
  )
  if (authorizedPayin.isErr) {
    return Result.err(authorizedPayin.error)
  }
  const cardAcquisitionPayin = CardAcquisitionPayinEntity.create({
    externalCardAcquisitionId: cardAcquisition.externalId,
    amount: command.overdraftLimit,
    employeeId: command.employeeId,
    externalAuthorizationId: authorizedPayin.value.externalAuthorizationId,
    reference: authorizedPayin.value.reference,
    status: authorizedPayin.value.status,
  })

  await cardAcquisitionPayinRepo.save(cardAcquisitionPayin)
  logger.log(`[updateCardAcquisitionOverdraft]:msToAnswer: ${now() - time}`)
  return Result.ok(command.overdraftLimit)
}
