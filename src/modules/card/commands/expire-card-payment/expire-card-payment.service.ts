import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CardPaymentRepositoryPort } from '../../database/card-payment/card-payment.repository.port'
import { ExpireCardPaymentCommand } from './expire-card-payment.command'

export async function expireCardPayment(
  command: ExpireCardPaymentCommand,
  unitOfWork: UnitOfWork,
  redis: RedisService,
): Promise<Result<string, TokenExpiredError | NotFoundException>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardPaymentRepo: CardPaymentRepositoryPort =
    unitOfWork.getCardPaymentRepository(command.correlationId)

  const cardPayment = await cardPaymentRepo.findOneByExternalPaymentIdOrThrow(
    command.externalPaymentId,
  )
  const expirePaymentRes = cardPayment.expirePayment()
  if (expirePaymentRes.isErr) {
    return Result.err(expirePaymentRes.error)
  }

  await cardPaymentRepo.save(cardPayment)
  await redis.persist.del(`physicalCardRequestPayment:${cardPayment.cardId}`)
  return Result.ok(cardPayment.cardId)
}
