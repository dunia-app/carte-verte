import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateEmployeeCodeCommand } from './update-employee-code.command'
import { updateEmployeeCode } from './update-employee-code.service'

@CommandHandler(UpdateEmployeeCodeCommand)
export class UpdateEmployeeCodeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateEmployeeCodeCommand) {
    return updateEmployeeCode(command, this.unitOfWork, this.configService)
  }
}
