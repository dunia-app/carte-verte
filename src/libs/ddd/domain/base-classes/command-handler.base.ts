import { ExceptionBase } from '../../../exceptions/exception.base'
import { UnitOfWorkPort } from '../ports/unit-of-work.port'
import { Result } from '../utils/result.util'
import { Command } from './command.base'

export abstract class CommandHandlerBase<
  CommandHandlerReturnType = unknown,
  CommandHandlerError extends ExceptionBase = ExceptionBase,
> {
  constructor(protected readonly unitOfWork: UnitOfWorkPort) {}

  // Forces all command handlers to implement a handle method
  abstract handle(
    command: Command<CommandHandlerReturnType, CommandHandlerError>,
  ): Promise<Result<CommandHandlerReturnType, CommandHandlerError>>

  protected logTransaction: boolean = true
  /**
   * Execute a command as a UnitOfWork to include
   * everything in a single atomic database transaction
   */
  execute(command: Command<CommandHandlerReturnType, CommandHandlerError>) {
    return this.unitOfWork.execute(
      command.correlationId,
      async () => this.handle(command),
      { logTransaction: this.logTransaction },
    )
  }
}
