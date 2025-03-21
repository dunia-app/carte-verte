import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { SendEmployeeAccountCreationReminderCommand } from './send-employee-account-creation-reminder.command'
import { sendEmployeeAccountCreationReminder } from './send-employee-account-creation-reminder.service'

@CommandHandler(SendEmployeeAccountCreationReminderCommand)
export class SendEmployeeAccountCreationReminderCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: SendEmployeeAccountCreationReminderCommand) {
    return sendEmployeeAccountCreationReminder(command, this.unitOfWork)
  }
}
