import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { ValidateCardAcquisitionPayinCaptureCommand } from './validate-card-acquisition-payin-capture.command'

export async function validateCardAcquisitionPayinCapture(
  command: ValidateCardAcquisitionPayinCaptureCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<string, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const found = await cardAcquisitionPayinRepo.findOneByReferenceOrThrow(
    command.payinReference,
  )
  found.validateCapture(command.externalPayinId, command.amount)

  const cardAcquisitionPayin = await cardAcquisitionPayinRepo.save(found)
  return Result.ok(cardAcquisitionPayin.id.value)
}
