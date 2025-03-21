import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { SendEmployeeNoTransactionReminderCommand } from './send-employee-no-transaction-reminder.command'
import { sendEmployeeNoTransactionReminder } from './send-employee-no-transaction-reminder.service'

@CommandHandler(SendEmployeeNoTransactionReminderCommand)
export class SendEmployeeNoTransactionReminderCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: SendEmployeeNoTransactionReminderCommand) {
    return sendEmployeeNoTransactionReminder(command, this.unitOfWork)
  }
}
