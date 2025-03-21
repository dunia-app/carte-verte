import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeAlreadyActivatedError,
  EmployeeAlreadyExistsError,
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
} from '../../errors/employee.errors'
import { SetEmployeeAccountCommand } from './set-employee-account.command'

@CommandHandler(SetEmployeeAccountCommand)
export class SetEmployeeAccountCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly configService: ConfigService,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: SetEmployeeAccountCommand,
  ): Promise<
    Result<
      EmployeeLoginResp,
      | EmployeeNewDeviceNotValidated
      | EmployeeCodeFormatNotCorrectError
      | EmployeeAlreadyActivatedError
      | EmployeeAlreadyExistsError
      | EmployeeFrozenError
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */

    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)
    const userRepo: UserRepositoryPort = this.unitOfWork.getUserRepository(
      command.correlationId,
    )
    const employeeRepo: EmployeeRepositoryPort =
      this.unitOfWork.getEmployeeRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)
    const [user, employee] = await Promise.all([
      userRepo.findOneByIdOrThrow(receiver.userId.value),
      employeeRepo.findOneByUserIdOrThrow(receiver.userId.value),
    ])

    // Setting an account validate the current device
    if (command.deviceId) {
      employee.pushDeviceIds(command.deviceId)
    }

    if (employee.status !== EmployeeStatus.EMPLOYEE_UNACTIVE) {
      return Result.err(new EmployeeAlreadyActivatedError())
    }

    if (!employee.isBaasUser) {
      const baasEmployeeRes = await this.baas.createUser({
        email: command.email,
        firstname: user.name.firstname,
        lastname: user.name.lastname,
        mobile: command.mobile,
        birthday: employee.birthday,
      })
      if (baasEmployeeRes.isErr) {
        return Result.err(new EmployeeAlreadyExistsError())
      }
      employee.setExternalId(baasEmployeeRes.value)
      receiver.phoneNumber = command.mobile
      await Promise.all([
        employeeRepo.save(employee),
        receiverRepo.save(receiver),
      ])
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
