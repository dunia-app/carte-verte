import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { CardEntity } from '../../domain/entities/card.entity'
import { CardAlreadyExistsError } from '../../errors/card.errors'
import { CreateVirtualCardCommand } from './create-virtual-card.command'

export async function createVirtualCard(
  command: CreateVirtualCardCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<UUID, CardAlreadyExistsError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  // Card uniqueness guard
  if (await cardRepo.exists(command.employeeId)) {
    /** Returning an Error instead of throwing it
     *  so a controller can handle it explicitly */
    return Result.err(new CardAlreadyExistsError())
  }

  const baasCardRes = await baas.createVirtualCard({
    externalEmployeeId: command.externalEmployeeId,
  })
  if (baasCardRes.isErr) {
    return Result.err(baasCardRes.error)
  }
  const baasCard = baasCardRes.unwrap()

  const card = CardEntity.create({
    externalId: baasCard.externalCardId,
    employeeId: new UUID(command.employeeId),
    publicToken: baasCard.publicToken,
    embossedName: baasCard.embossedName,
    suffix: baasCard.suffix,
    design: command.design,
  })

  const created = await cardRepo.save(card)
  return Result.ok(created.id)
}
