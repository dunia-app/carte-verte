import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CreateBaasAcquisitionsCommand } from './create-baas-acquisitions.command'
import { createBaasAcquisitions } from './create-baas-acquisitions.service'

@CommandHandler(CreateBaasAcquisitionsCommand)
export class CreateBaasAcquisitionsCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: CreateBaasAcquisitionsCommand) {
    return createBaasAcquisitions(
      command,
      this.unitOfWork,
      this.baas,
      this.configService,
    )
  }
}
