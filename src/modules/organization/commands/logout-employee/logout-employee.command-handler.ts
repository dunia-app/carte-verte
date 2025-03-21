import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { LogoutEmployeeCommand } from './logout-employee.command'

@CommandHandler(LogoutEmployeeCommand)
export class LogoutEmployeeCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: LogoutEmployeeCommand,
  ): Promise<
    Result<
      boolean,
      EmployeeNotActivatedError | EmployeeFrozenError | EmployeeNotFoundError
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    try {
      const receiverRepo: ReceiverRepositoryPort =
        this.unitOfWork.getReceiverRepository(command.correlationId)

      const employeeRepo: EmployeeRepositoryPort =
        this.unitOfWork.getEmployeeRepository(command.correlationId)

      const employee = await employeeRepo.findOneByUserIdOrThrow(
        command.employeeId,
      )

      const receiver = await receiverRepo.findOneByEmailOrThrow(
        employee.userId.value,
      )

      const refreshToken = employee.logout(command.refreshToken)
      const deviceToken = receiver.popDeviceTokens(command.deviceId)

      if (refreshToken.isErr) {
        return Result.err(refreshToken.error)
      }

      await Promise.all([
        employeeRepo.save(employee),
        deviceToken.isOk && deviceToken.value
          ? receiverRepo.save(receiver)
          : null,
      ])
      return Result.ok(true)
    } catch (e) {
      if (e instanceof NotFoundException) {
        return Result.err(new EmployeeNotFoundError(e))
      } else {
        throw e
      }
    }
  }
}
