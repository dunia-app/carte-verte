import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ExpirePhysicalCardRequestCommand } from './expire-physical-card-request.command'
import { expirePhysicalCardRequest } from './expire-physical-card-request.service'

@CommandHandler(ExpirePhysicalCardRequestCommand)
export class ExpirePhysicalCardRequestCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: ExpirePhysicalCardRequestCommand) {
    return expirePhysicalCardRequest(command, this.unitOfWork, this.redis)
  }
}
