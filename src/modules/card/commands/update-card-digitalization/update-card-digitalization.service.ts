import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { CardDigitalizationAlreadyAddedError } from '../../errors/card.errors'
import { UpdateCardDigitalizationCommand } from './update-card-digitalization.command'

export async function updateCardDigitalization(
  command: UpdateCardDigitalizationCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<UUID, CardDigitalizationAlreadyAddedError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const found = await cardRepo.findOneByExternalIdOrThrow(
    command.externalCardId,
  )
  const res = found.completeCardDigitalization(
    command.cardDigitizationId,
    command.provider,
    command.deviceName,
    command.deviceType,
  )
  if (res.isErr) {
    return Result.ok(found.id)
  }

  const card = await cardRepo.save(found)
  return Result.ok(card.id)
}
