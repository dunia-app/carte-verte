import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyLockedError } from '../../errors/card.errors'
import { LockCardCommand } from './lock-card.command'

export async function lockCard(
  command: LockCardCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<LockStatus, CardAlreadyLockedError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
    command.employeeId,
  )
  const res = card.lock()
  if (res.isErr) {
    return Result.err(res.error)
  }

  await baas.lockCard(card.externalId, card.cardDigitalizationIds)

  await cardRepo.save(card)
  return Result.ok(card.lockStatus)
}
