import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ConfirmCardPaymentCommand } from './confirm-card-payment.command'
import { confirmCardPayment } from './confirm-card-payment.service'

@CommandHandler(ConfirmCardPaymentCommand)
export class ConfirmCardPaymentCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: ConfirmCardPaymentCommand) {
    return confirmCardPayment(command, this.unitOfWork, this.redis)
  }
}
