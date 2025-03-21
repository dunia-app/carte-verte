import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ExpireCardPaymentCommand } from './expire-card-payment.command'
import { expireCardPayment } from './expire-card-payment.service'

@CommandHandler(ExpireCardPaymentCommand)
export class ExpireCardPaymentCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: ExpireCardPaymentCommand) {
    return expireCardPayment(command, this.unitOfWork, this.redis)
  }
}
