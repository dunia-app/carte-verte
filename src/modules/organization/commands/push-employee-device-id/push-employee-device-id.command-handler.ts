import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { PushEmployeeDeviceIdCommand } from './push-employee-device-id.command'
import { pushEmployeeDeviceId } from './push-employee-device-id.service'

@CommandHandler(PushEmployeeDeviceIdCommand)
export class PushEmployeeDeviceIdCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: PushEmployeeDeviceIdCommand) {
    return pushEmployeeDeviceId(command, this.unitOfWork)
  }
}
