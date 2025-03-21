import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyUnlockedError } from '../../errors/card.errors'
import { UnlockCardCommand } from './unlock-card.command'

export async function unlockCard(
  command: UnlockCardCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<LockStatus, CardAlreadyUnlockedError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
    command.employeeId,
  )
  const res = card.unlock()
  if (res.isErr) {
    return Result.err(res.error)
  }

  await baas.unlockCard(card.externalId, card.cardDigitalizationIds)

  await cardRepo.save(card)
  return Result.ok(card.lockStatus)
}
