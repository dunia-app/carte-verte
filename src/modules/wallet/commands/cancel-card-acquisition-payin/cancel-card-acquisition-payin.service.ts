import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CancelCardAcquisitionPayinCommand } from './cancel-card-acquisition-payin.command'

export async function cancelCardAcquisitionPayin(
  command: CancelCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisition: CardAcquisitionService,
): Promise<Result<boolean, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const payin = command.transactionExternalPaymentId
    ? await cardAcquisitionPayinRepo.findOneByTransactionExternalPaymentIdAuthorized(
        command.transactionExternalPaymentId,
      )
    : await cardAcquisitionPayinRepo.findOneActiveByEmployeeIdOrThrow(
        command.employeeId,
      )
  if (!payin) {
    return Result.ok(false)
  }

  try {
    // TO delete once everyone is on hipay V2
    if (payin.externalAuthorizationId?.includes('_order_')) {
      const cancelledPayin = await cardAcquisition.cancelPayin(payin.reference)
      if (cancelledPayin.isErr) {
        logger.warn(
          `[captureCardAcquisitionPayin]:error while cancelling payin: ${cancelledPayin.error}`,
        )
      }
    } else {
      const cancelledPayin = await baas.cancelPayin(
        payin.externalAuthorizationId!,
      )
      if (cancelledPayin.isErr) {
        logger.warn(
          `[captureCardAcquisitionPayin]:error while cancelling payin: ${cancelledPayin.error}`,
        )
      }
    }
  } catch (e) {
    logger.warn(
      `[captureCardAcquisitionPayin]:error while cancelling payin: ${command.employeeId} ${e}`,
    )
  }
  cardAcquisitionPayinRepo.delete([payin])
  return Result.ok(true)
}
