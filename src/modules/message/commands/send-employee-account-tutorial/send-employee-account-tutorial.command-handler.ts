import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { SendEmployeeAccountTutorialCommand } from './send-employee-account-tutorial.command'
import { sendEmployeeAccountTutorial } from './send-employee-account-tutorial.service'

@CommandHandler(SendEmployeeAccountTutorialCommand)
export class SendEmployeeAccountTutorialCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: SendEmployeeAccountTutorialCommand) {
    return sendEmployeeAccountTutorial(command, this.unitOfWork)
  }
}
