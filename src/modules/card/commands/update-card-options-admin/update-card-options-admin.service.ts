import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import { UpdateCardOptionsAdminCommand } from './update-card-options-admin.command'

export async function updateCardOptionsAdmin(
  command: UpdateCardOptionsAdminCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const cards = await cardRepo.findMany({ lockStatus: LockStatus.UNLOCK })

  const batchSize = 20 // Change this to the desired batch size
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize)
    await Promise.all(
      batch.map((card) =>
        baas.updateCardOptions(card.externalId, {
          nfc: command.nfc,
          online: command.online,
          foreign: command.foreign,
        }),
      ),
    )
  }

  return Result.ok(cards.length)
}
