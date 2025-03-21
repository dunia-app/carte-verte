import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'
import { SetEmployeeCodeCommand } from './set-employee-code.command'

@CommandHandler(SetEmployeeCodeCommand)
export class SetEmployeeCodeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: SetEmployeeCodeCommand,
  ): Promise<
    Result<
      EmployeeLoginResp,
      | EmployeeNewDeviceNotValidated
      | EmployeeCodeFormatNotCorrectError
      | EmployeeNotActivatedError
      | EmployeeFrozenError
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */

    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const employeeRepo: EmployeeRepositoryPort =
      this.unitOfWork.getEmployeeRepository(command.correlationId)

    const employee = await employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    if (command.deviceId && employee.pushDeviceIds(command.deviceId).isOk) {
      return Result.err(new EmployeeNewDeviceNotValidated())
    }

    if (employee.status === EmployeeStatus.EMPLOYEE_UNACTIVE) {
      return Result.err(new EmployeeNotActivatedError())
    }
    const refreshToken = await employee.setCode(
      command.code,
      this.configService.getSaltRound(),
      command.deviceId,
    )
    if (refreshToken.isErr) {
      return Result.err(refreshToken.error)
    }

    await employeeRepo.save(employee)
    return Result.ok({
      employeeId: employee.id,
      refreshToken: refreshToken.unwrap(),
    })
  }
}
