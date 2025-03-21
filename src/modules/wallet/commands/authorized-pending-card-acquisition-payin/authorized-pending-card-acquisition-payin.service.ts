import { CardAcquisitionService } from "../../../../infrastructure/card-acquisition-service/card-acquisition-service"
import { UnitOfWork } from "../../../../infrastructure/database/unit-of-work/unit-of-work"
import { Result } from "../../../../libs/ddd/domain/utils/result.util"
import { ExceptionBase } from "../../../../libs/exceptions/exception.base"
import { CardAcquisitionPayinRepositoryPort } from "../../database/card-acquisition-payin/card-acquisition-payin.repository.port"
import { CardAcquisitionPayinStatus } from "../../domain/entities/card-acquisition-payin.types"
import { AuthorizePendingCardAcquisitionPayinCommand } from "./authorized-pending-card-acquisition-payin.command"

export async function authorizePendingCardAcquisitionPayin(
  command: AuthorizePendingCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const payins = await cardAcquisitionPayinRepo.findManyPending()
  if (payins.length === 0) {
    return Result.ok(0)
  }
  for (const payin of payins) {
    const externalPayin = await cardAcquisitionService.getCardTransactionStatus(
      payin.reference,
    )
    if (externalPayin.isErr) {
      continue
    }
    if (
      (externalPayin.value === CardAcquisitionPayinStatus.Authorized &&
        payin.authorize()) ||
      (externalPayin.value === CardAcquisitionPayinStatus.Failed &&
        payin.fail())
    ) {
      await cardAcquisitionPayinRepo.save(payin)
    }
  }

  return Result.ok(payins.length)
}
