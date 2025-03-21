import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { FreezeEmployeeCommand } from './freeze-employee.command'
import { freezeEmployee } from './freeze-employee.service'

@CommandHandler(FreezeEmployeeCommand)
export class FreezeEmployeeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: FreezeEmployeeCommand) {
    return freezeEmployee(command, this.unitOfWork, this.baas)
  }
}
