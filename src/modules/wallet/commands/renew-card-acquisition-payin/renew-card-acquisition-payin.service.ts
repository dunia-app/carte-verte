import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { CardAcquisitionPayinEntity } from '../../domain/entities/card-acquisition-payin.entity'
import { CancelCardAcquisitionPayinCommand } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.command'
import { cancelCardAcquisitionPayin } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.service'
import { RenewCardAcquisitionPayinCommand } from './renew-card-acquisition-payin.command'

export async function renewCardAcquisitionPayin(
  command: RenewCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)
  const cardAcquisitionRepo: CardAcquisitionRepositoryPort =
    unitOfWork.getCardAcquisitionRepository(command.correlationId)
  const employeeRepo = unitOfWork.getEmployeeRepository(command.correlationId)

  const payins = await cardAcquisitionPayinRepo.findManyToBeExpired()
  if (payins.length == 0) {
    return Result.ok(0)
  }
  const [employeesWithInfo, cardAcquisitions] = await Promise.all([
    employeeRepo.findManyWithInfoById(payins.map((payin) => payin.employeeId)),
    cardAcquisitionRepo.findManyByExternalIds(
      payins.map((payin) => payin.externalCardAcquisitionId!),
    ),
  ])
  let errors = 0
  for (const payin of payins) {
    const employeeWithInfo = employeesWithInfo.find(
      (e) => e.id.value === payin.employeeId,
    )!
    const cardAcquisition = cardAcquisitions.find(
      (ca) => ca.externalId === payin.externalCardAcquisitionId,
    )!
    try {
      // Cancel the existing one
      const cancelCommand = new CancelCardAcquisitionPayinCommand({
        correlationId: command.correlationId,
        employeeId: employeeWithInfo.id.value,
      })
      await cancelCardAcquisitionPayin(
        cancelCommand,
        unitOfWork,
        baas,
        cardAcquisitionService,
      )
    } catch (e) {
      logger.warn(
        `[renewCardAcquisitionPayin]: ${employeeWithInfo.id.value} ${e}`,
      )
    }

    try {
      // Create a new one with the right amount
      const authorizedPayin = await baas.authorizePayin(
        payin.amount,
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
      if (authorizedPayin.isErr) {
        logger.warn(
          `[renewCardAcquisitionPayin]: ${payin.employeeId} ${authorizedPayin.error}`,
        )
        continue
      }
      const cardAcquisitionPayin = CardAcquisitionPayinEntity.create({
        externalCardAcquisitionId: cardAcquisition.externalId,
        amount: payin.amount,
        employeeId: employeeWithInfo.id.value,
        externalAuthorizationId: authorizedPayin.value.externalAuthorizationId,
        reference: authorizedPayin.value.reference,
        status: authorizedPayin.value.status,
      })

      await cardAcquisitionPayinRepo.save(cardAcquisitionPayin)
    } catch (e) {
      logger.error(
        `[renewCardAcquisitionPayin]: Error in renew card acquisition ${payin.id}: ${e}`,
      )
      errors++
    }
  }
  return Result.ok(payins.length - errors)
}
