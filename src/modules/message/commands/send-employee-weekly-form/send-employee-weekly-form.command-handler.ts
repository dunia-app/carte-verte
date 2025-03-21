import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { SendEmployeeWeeklyFormCommand } from './send-employee-weekly-form.command'
import { sendEmployeeWeeklyForm } from './send-employee-weekly-form.service'

@CommandHandler(SendEmployeeWeeklyFormCommand)
export class SendEmployeeWeeklyFormCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: SendEmployeeWeeklyFormCommand) {
    return sendEmployeeWeeklyForm(command, this.unitOfWork)
  }
}
