import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase, NotFoundException } from '../../../../libs/exceptions/index'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { RemoveEmployeeCommand } from './remove-employee.command'

@CommandHandler(RemoveEmployeeCommand)
export class RemoveEmployeeCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: RemoveEmployeeCommand,
  ): Promise<Result<string, ExceptionBase>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const employeeRepo: EmployeeRepositoryPort =
      this.unitOfWork.getEmployeeRepository(command.correlationId)

    const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)
    if (found.organizationId.value !== command.organizationId) {
      throw new NotFoundException('Employee not found')
    }
    const res = found.remove()

    if (res.isErr) {
      throw new NotFoundException()
    }

    const removed = await employeeRepo.save(found)
    return Result.ok(removed.id.value)
  }
}
