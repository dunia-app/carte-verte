import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { DeleteEmployeesCommand } from './delete-employees.command'
import { deleteEmployees } from './delete-employees.service'

@CommandHandler(DeleteEmployeesCommand)
export class DeleteEmployeesCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: DeleteEmployeesCommand,
  ): Promise<Result<null, ExceptionBase>> {
    return deleteEmployees(command, this.unitOfWork, this.baas)
  }
}
