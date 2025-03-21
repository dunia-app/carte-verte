import { NotFoundException } from '@nestjs/common'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { LoginEmployeeCommand } from './login-employee.command'

export async function loginEmployee(
  command: LoginEmployeeCommand,
  unitOfWork: UnitOfWork,
  redis: RedisService,
  config: ConfigService,
): Promise<
  Result<
    EmployeeLoginResp,
    | EmployeeNotActivatedError
    | WrongEmployeeCodeError
    | EmployeeCodeTooManyFailedAttemptError
    | EmployeeFrozenError
    | EmployeeNotFoundError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
   (including changes caused by Domain Events) into one 
   atomic database transaction */
  try {
    const receiverRepo: ReceiverRepositoryPort =
      unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const employeeRepo: EmployeeRepositoryPort =
      unitOfWork.getEmployeeRepository(command.correlationId)

    const employee = await employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    const refreshToken = employee.login(
      command.code,
      config.getSaltRound(),
      command.deviceId,
    )

    if (refreshToken.isErr) {
      if (refreshToken.error instanceof EmployeeCodeTooManyFailedAttemptError) {
        redis.persist.set(
          receiver.email.value,
          JSON.stringify({ email: command.email }),
          'EX',
          getCacheTime(CacheTimes.OneHour),
        )
        await employeeRepo.save(employee)
      }
      if (refreshToken.error instanceof WrongEmployeeCodeError) {
        await employeeRepo.save(employee)
      }
      return Result.err(refreshToken.error)
    }

    if (
      command.chechDeviceId &&
      command.deviceId &&
      employee.pushDeviceIds(command.deviceId).isOk
    ) {
      return Result.err(new EmployeeNewDeviceNotValidated())
    }

    await employeeRepo.save(employee)
    redis.persist.del(`smsTokenValidated:${command.email}`)
    return Result.ok({
      employeeId: employee.id,
      refreshToken: refreshToken.unwrap(),
    })
  } catch (e) {
    if (e instanceof NotFoundException) {
      return Result.err(new EmployeeNotFoundError(e))
    } else {
      throw e
    }
  }
}
