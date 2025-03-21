import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ValidateCardAcquisitionCommand } from './validate-card-acquisition.command'
import { validateCardAcquisition } from './validate-card-acquisition.service'

@CommandHandler(ValidateCardAcquisitionCommand)
export class ValidateCardAcquisitionCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly cardAcquisition: CardAcquisitionService,
    private readonly baas: Baas,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: ValidateCardAcquisitionCommand) {
    return validateCardAcquisition(
      command,
      this.unitOfWork,
      this.cardAcquisition,
      this.baas,
      this.configService,
    )
  }
}
