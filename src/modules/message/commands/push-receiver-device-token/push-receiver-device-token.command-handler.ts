import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { PushReceiverDeviceTokenCommand } from './push-receiver-device-token.command'
import { pushReceiverDeviceToken } from './push-receiver-device-token.service'

@CommandHandler(PushReceiverDeviceTokenCommand)
export class PushReceiverDeviceTokenCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: PushReceiverDeviceTokenCommand) {
    return pushReceiverDeviceToken(command, this.unitOfWork)
  }
}
