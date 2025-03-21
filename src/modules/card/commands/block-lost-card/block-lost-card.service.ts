import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'
import { BlockLostCardCommand } from './block-lost-card.command'

export async function blockLostCard(
  command: BlockLostCardCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<LockStatus, CardAlreadyBlockedError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  try {
    const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
      command.employeeId,
    )
    const res = card.blockLostCard()
    if (res.isErr) {
      return Result.err(res.error)
    }

    await baas.blockLostCard(card.externalId, card.cardDigitalizationIds)

    await cardRepo.save(card)
    return Result.ok(card.lockStatus)
  } catch (e) {
    return Result.err(new CardAlreadyBlockedError(e))
  }
}
