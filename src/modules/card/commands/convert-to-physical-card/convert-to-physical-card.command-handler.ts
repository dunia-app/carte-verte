import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ConvertToPhysicalCardCommand } from './convert-to-physical-card.command'
import { convertToPhysicalCard } from './convert-to-physical-card.service'

@CommandHandler(ConvertToPhysicalCardCommand)
export class ConvertToPhysicalCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly redis: RedisService,
    protected readonly baas: Baas,
    protected readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: ConvertToPhysicalCardCommand) {
    return convertToPhysicalCard(
      command,
      this.unitOfWork,
      this.redis,
      this.baas,
      this.config,
    )
  }
}
