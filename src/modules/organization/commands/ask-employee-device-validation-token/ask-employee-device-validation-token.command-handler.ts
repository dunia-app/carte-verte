import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AskEmployeeDeviceValidationTokenCommand } from './ask-employee-device-validation-token.command'
import { askEmployeeDeviceValidationToken } from './ask-employee-device-validation-token.service'

@CommandHandler(AskEmployeeDeviceValidationTokenCommand)
export class AskEmployeeDeviceValidationTokenCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: AskEmployeeDeviceValidationTokenCommand) {
    return askEmployeeDeviceValidationToken(
      command,
      this.unitOfWork,
      this.baas,
      this.redis,
    )
  }
}
