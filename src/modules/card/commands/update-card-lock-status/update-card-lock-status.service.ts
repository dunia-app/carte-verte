import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import {
  CardAlreadyBlockedError,
  CardAlreadyLockedError,
  CardAlreadyUnlockedError,
} from '../../errors/card.errors'
import { UpdateCardLockStatusCommand } from './update-card-lock-status.command'

export async function updateCardLockStatus(
  command: UpdateCardLockStatusCommand,
  unitOfWork: UnitOfWork,
): Promise<
  Result<
    string,
    CardAlreadyLockedError | CardAlreadyBlockedError | CardAlreadyUnlockedError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const found = await cardRepo.findOneByExternalIdOrThrow(
    command.externalCardId,
  )
  const existingStatus = found.lockStatus
  switch (command.lockStatus) {
    case LockStatus.LOCK:
      found.lock()
      break
    case LockStatus.UNLOCK:
      found.unlock()
      break
    case LockStatus.DESTROYED:
      found.blockDestroyedCard()
      break
    case LockStatus.STOLEN:
      found.blockStolenCard()
      break
    case LockStatus.LOST:
      found.blockLostCard()
      break
  }

  if (existingStatus !== found.lockStatus) {
    await cardRepo.save(found)
  }
  return Result.ok(found.lockStatus)
}
