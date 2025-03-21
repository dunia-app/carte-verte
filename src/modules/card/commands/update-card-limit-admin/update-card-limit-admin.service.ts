import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { LockStatus } from '../../domain/entities/card.types'
import { UpdateCardLimitAdminCommand } from './update-card-limit-admin.command'

export async function updateCardLimitAdmin(
  command: UpdateCardLimitAdminCommand,
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
        baas.updateBothCardDailyLimit(
          card.externalId,
          command.limitPaymentDay,
          command.paymentDailyLimit,
        ),
      ),
    )
  }

  return Result.ok(cards.length)
}
