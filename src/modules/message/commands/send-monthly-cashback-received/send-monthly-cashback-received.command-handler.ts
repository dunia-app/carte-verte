import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { SendMonthlyCashbackReceivedCommand } from './send-monthly-cashback-received.command'
import { sendMonthlyCashbackReceived } from './send-monthly-cashback-received.service'

@CommandHandler(SendMonthlyCashbackReceivedCommand)
export class SendMonthlyCashbackReceivedCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: SendMonthlyCashbackReceivedCommand) {
    return sendMonthlyCashbackReceived(command, this.unitOfWork)
  }
}
