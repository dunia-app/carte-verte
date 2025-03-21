import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { InitiateCardDigitalizationCommand } from './initiate-card-digitalization.command'
import { initiateCardDigitalization } from './initiate-card-digitalization.service'

@CommandHandler(InitiateCardDigitalizationCommand)
export class InitiateCardDigitalizationCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: InitiateCardDigitalizationCommand) {
    return initiateCardDigitalization(command, this.unitOfWork, this.baas)
  }
}
