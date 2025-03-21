import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { RefreshEmployeeTokenCommand } from './refresh-employee-token.command'
import { refreshEmployeeToken } from './refresh-employee-token.service'

@CommandHandler(RefreshEmployeeTokenCommand)
export class RefreshEmployeeTokenCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: RefreshEmployeeTokenCommand) {
    return refreshEmployeeToken(command, this.unitOfWork, this.config)
  }
}
