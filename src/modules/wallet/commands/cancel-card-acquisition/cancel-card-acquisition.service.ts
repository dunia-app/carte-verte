import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { CancelCardAcquisitionCommand } from './cancel-card-acquisition.command'

export async function cancelCardAcquisition(
  command: CancelCardAcquisitionCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<boolean, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionRepo: CardAcquisitionRepositoryPort =
    unitOfWork.getCardAcquisitionRepository(command.correlationId)
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const cardAcquisition =
    await cardAcquisitionRepo.findOneActiveByEmployeeIdOrThrow(
      command.employeeId,
    )
  const payin =
    await cardAcquisitionPayinRepo.findOneActiveByExternalCardAcquisitionId(
      cardAcquisition.externalId,
    )
  if (cardAcquisition.cancel()) {
    const [_bassCardAcquisitionRes, cardAcquisitionPayinRes] =
      await Promise.all([
        // cardAcquisitionService.cancelCardAcquisition(
        //   cardAcquisition.token.getDecryptedValue(
        //     config.getStr('APP_SECRET'),
        //     config.getStr('APP_SALT'),
        //   ),
        // ),
        baas.deleteBaasCardAcquisition(cardAcquisition.baasId),
        payin
          ? // TO delete once everyone is on hipay V2
            !payin.externalAuthorizationId?.startsWith('ekip_order')
            ? cardAcquisitionService.cancelPayin(payin.reference)
            : baas.cancelPayin(payin.externalAuthorizationId!)
          : Result.ok(true),
      ])
    if (cardAcquisitionPayinRes.isOk) {
      await Promise.all([
        cardAcquisitionRepo.save(cardAcquisition),
        payin ? cardAcquisitionPayinRepo.delete([payin]) : null,
      ])
      return Result.ok(true)
    }
  }
  return Result.ok(false)
}
