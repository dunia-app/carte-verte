import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CreateEmployeeCommand } from './create-employee.command'
import { createEmployee } from './create-employee.service'

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: CreateEmployeeCommand) {
    return createEmployee(command, this.unitOfWork)
  }
}
