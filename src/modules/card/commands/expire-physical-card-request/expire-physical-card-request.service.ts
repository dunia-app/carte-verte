import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import {
  CardConversionAlreadyCompletedError,
  CardConversionNotInitiatedError,
  CardNotUnlockedError,
} from '../../errors/card.errors'
import { ExpirePhysicalCardRequestCommand } from './expire-physical-card-request.command'

export async function expirePhysicalCardRequest(
  command: ExpirePhysicalCardRequestCommand,
  unitOfWork: UnitOfWork,
  redis: RedisService,
): Promise<
  Result<
    boolean,
    | CardNotUnlockedError
    | CardConversionNotInitiatedError
    | CardConversionAlreadyCompletedError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )

  const card = await cardRepo.findOneByIdOrThrow(command.cardId)

  const cacheResult = await redis.persist.get(
    `initiateCardConversion:${card.id.value}`,
  )
  if (!cacheResult) {
    return Result.err(new TokenExpiredError())
  }

  const requestPhysicalRes = card.expirePhysical()
  if (requestPhysicalRes.isErr) {
    return Result.err(requestPhysicalRes.error)
  }

  await cardRepo.save(card)
  await redis.persist.del(`initiateCardConversion:${card.id.value}`)
  return Result.ok(true)
}
