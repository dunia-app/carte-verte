import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AskNewEmployeeLoginTokenCommand } from './ask-new-employee-login-token.command'
import { askNewEmployeeLoginToken } from './ask-new-employee-login-token.service'

@CommandHandler(AskNewEmployeeLoginTokenCommand)
export class AskNewEmployeeLoginTokenCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: AskNewEmployeeLoginTokenCommand) {
    return askNewEmployeeLoginToken(command, this.unitOfWork)
  }
}
