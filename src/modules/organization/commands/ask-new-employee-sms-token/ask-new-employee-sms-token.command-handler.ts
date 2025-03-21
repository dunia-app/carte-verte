import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AskNewEmployeeSmsTokenCommand } from './ask-new-employee-sms-token.command'
import { askNewEmployeeSmsToken } from './ask-new-employee-sms-token.service'

@CommandHandler(AskNewEmployeeSmsTokenCommand)
export class AskNewEmployeeSmsTokenCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: AskNewEmployeeSmsTokenCommand) {
    return askNewEmployeeSmsToken(command, this.unitOfWork, this.redis)
  }
}
