import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CardAcquisitionPayinEntity } from '../../domain/entities/card-acquisition-payin.entity'
import { PreAuthorizeCardAcquisitionPayinCommand } from './pre-authorize-card-acquisition-payin.command'

export async function preAuthorizeCardAcquisitionPayin(
  command: PreAuthorizeCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<boolean, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const authorizedPayin = await baas.authorizePayin(
    command.amount,
    command.paymentProduct,
    command.baasId,
    command.firstname,
    command.lastname,
    command.email,
    command.address,
    command.cardHolder,
  )
  if (authorizedPayin.isErr) {
    logger.warn(
      `[preAuthorizeCardAcquisitionPayin]:error while authorizing payin: ${authorizedPayin.error}`,
    )
    return Result.err(authorizedPayin.error)
  }
  const preAuthorizePayin = CardAcquisitionPayinEntity.create({
    externalCardAcquisitionId: command.externalCardAcquisitionId,
    amount: command.amount,
    employeeId: command.employeeId,
    externalAuthorizationId: authorizedPayin.value.externalAuthorizationId!,
    reference: authorizedPayin.value.reference,
    status: authorizedPayin.value.status,
  })

  const created = await cardAcquisitionPayinRepo.save(preAuthorizePayin)
  return Result.ok(true)
}
