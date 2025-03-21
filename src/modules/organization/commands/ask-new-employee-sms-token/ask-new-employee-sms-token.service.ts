import { NotFoundException } from '@nestjs/common'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { AskNewEmployeeSmsTokenCommand } from './ask-new-employee-sms-token.command'

export async function askNewEmployeeSmsToken(
  command: AskNewEmployeeSmsTokenCommand,
  unitOfWork: UnitOfWork,
  redis: RedisService,
): Promise<Result<string, EmployeeFrozenError | EmployeeNotFoundError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

  try {
    const receiverRepo: ReceiverRepositoryPort =
      unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const employeeRepo: EmployeeRepositoryPort =
      unitOfWork.getEmployeeRepository(command.correlationId)

    const found = await employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    return redis.fetch(
      `askNewEmployeeSmsToken:${found.id.value}`,
      1, // Cache time set to 1 second
      async () => {
        const res = found.askNewSmsToken(
          command.mobile,
          command.email,
          command.deviceId,
        )
        if (res.isErr) {
          return Result.err(res.error)
        }
        await employeeRepo.save(found)

        return Result.ok(res.value)
      },
    )
  } catch (e) {
    if (e instanceof NotFoundException) {
      return Result.err(new EmployeeNotFoundError(e))
    } else {
      throw e
    }
  }
}
