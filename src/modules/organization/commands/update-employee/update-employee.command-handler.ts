import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateEmployeeCommand } from './update-employee.command'
import { updateEmployee } from './update-employee.service'

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateEmployeeCommand) {
    return updateEmployee(command, this.unitOfWork, this.baas)
  }
}
