import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { AuthorizePendingCardAcquisitionCommand } from './authorized-pending-card-acquisition.command'

export async function authorizePendingCardAcquisition(
  command: AuthorizePendingCardAcquisitionCommand,
  unitOfWork: UnitOfWork,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionRepo: CardAcquisitionRepositoryPort =
    unitOfWork.getCardAcquisitionRepository(command.correlationId)

  const cardAcquisitions = await cardAcquisitionRepo.findManyPending()
  if (cardAcquisitions.length === 0) {
    return Result.ok(0)
  }
  for (const cardAcquisition of cardAcquisitions) {
    const employee = await unitOfWork
      .getEmployeeRepository(command.correlationId)
      .findOneByIdOrThrow(cardAcquisition.employeeId)
    const externalCardAcquisition =
      await cardAcquisitionService.getCardAcquisition(
        cardAcquisition.externalId,
        employee.externalEmployeeId!,
      )
    if (externalCardAcquisition.isErr) {
      continue
    }
    if (
      (externalCardAcquisition.value.status ===
        CardAcquisitionPayinStatus.Authorized &&
        cardAcquisition.authorize()) ||
      (externalCardAcquisition.value.status ===
        CardAcquisitionPayinStatus.Failed &&
        cardAcquisition.fail())
    ) {
      await cardAcquisitionRepo.save(cardAcquisition)
    }
  }

  return Result.ok(cardAcquisitions.length)
}
