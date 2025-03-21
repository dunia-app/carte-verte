import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ValidateCardAcquisitionPayinCaptureCommand } from './validate-card-acquisition-payin-capture.command'
import { validateCardAcquisitionPayinCapture } from './validate-card-acquisition-payin-capture.service'

@CommandHandler(ValidateCardAcquisitionPayinCaptureCommand)
export class ValidateCardAcquisitionPayinCaptureCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: ValidateCardAcquisitionPayinCaptureCommand) {
    return validateCardAcquisitionPayinCapture(command, this.unitOfWork)
  }
}
