import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { AskNewEmployeeSmsTokenCommand } from '../ask-new-employee-sms-token/ask-new-employee-sms-token.command'
import { askNewEmployeeSmsToken } from '../ask-new-employee-sms-token/ask-new-employee-sms-token.service'
import { AskEmployeeDeviceValidationTokenCommand } from './ask-employee-device-validation-token.command'

export async function askEmployeeDeviceValidationToken(
  command: AskEmployeeDeviceValidationTokenCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  redis: RedisService,
): Promise<Result<string, EmployeeFrozenError | EmployeeNotFoundError>> {
  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )

  const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

  if (!receiver.phoneNumber) {
    const employeeRepo: EmployeeRepositoryPort =
      unitOfWork.getEmployeeRepository(command.correlationId)

    const found = await employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )
    const res = await baas.getUser(found.externalEmployeeId!)
    if (res.isErr) {
      return Result.err(res.error)
    }
    receiver.phoneNumber = res.value.mobile
  }
  await receiverRepo.save(receiver)
  const res = await askNewEmployeeSmsToken(
    new AskNewEmployeeSmsTokenCommand({
      correlationId: command.correlationId,
      email: command.email,
      mobile: receiver.phoneNumber,
      deviceId: command.deviceId,
    }),
    unitOfWork,
    redis,
  )
  return res
}
