import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import {
  CardAlreadyActivatedError,
  CardNotUnlockedError,
} from '../../errors/card.errors'
import { ActivatePhysicalCardCommand } from './activate-physical-card.command'

export async function activatePhysicalCard(
  command: ActivatePhysicalCardCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<
  Result<
    boolean,
    CardNotUnlockedError | CardAlreadyActivatedError | NotFoundException
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const found = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
    command.employeeId,
  )
  const res = found.activate()
  if (res.isErr) {
    return Result.err(res.error)
  }

  const baasRes = await baas.activateNfcOption(found.externalId)
  if (baasRes.isErr) {
    return Result.err(baasRes.error)
  }

  await cardRepo.save(found)
  return Result.ok(true)
}
