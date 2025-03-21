import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { UpdateCardPinTryExceededCommand } from './update-card-pin-try-exceeded.command'

export async function updateCardPinTryExceeded(
  command: UpdateCardPinTryExceededCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<boolean, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const found = await cardRepo.findOneByExternalIdOrThrow(
    command.externalCardId,
  )

  if (found.pinTryExceeded !== command.pinTryExceeded) {
    found.pinTryExceeded = command.pinTryExceeded
    await cardRepo.save(found)
  }
  return Result.ok(command.pinTryExceeded)
}
