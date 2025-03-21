import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UnfreezeEmployeeCommand } from './unfreeze-employee.command'
import { unfreezeEmployee } from './unfreeze-employee.service'

@CommandHandler(UnfreezeEmployeeCommand)
export class UnfreezeEmployeeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: UnfreezeEmployeeCommand) {
    return unfreezeEmployee(command, this.unitOfWork, this.baas)
  }
}
