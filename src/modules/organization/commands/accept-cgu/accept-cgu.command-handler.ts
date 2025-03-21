import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeAlreadyAcceptedCguError,
  EmployeeFrozenError,
} from '../../errors/employee.errors'
import { AcceptCguCommand } from './accept-cgu.command'

@CommandHandler(AcceptCguCommand)
export class AcceptCguCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: AcceptCguCommand,
  ): Promise<
    Result<Boolean, EmployeeAlreadyAcceptedCguError | EmployeeFrozenError>
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const employeeRepo: EmployeeRepositoryPort =
      this.unitOfWork.getEmployeeRepository(command.correlationId)

    const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)
    const res = found.acceptCgu()
    if (res.isErr) {
      return Result.err(res.error)
    }

    await employeeRepo.save(found)
    return Result.ok(true)
  }
}
