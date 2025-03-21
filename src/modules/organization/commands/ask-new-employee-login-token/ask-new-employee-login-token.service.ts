import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { AskNewEmployeeLoginTokenCommand } from './ask-new-employee-login-token.command'

export async function askNewEmployeeLoginToken(
  command: AskNewEmployeeLoginTokenCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<boolean, EmployeeFrozenError | EmployeeNotFoundError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )

  const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const found = await employeeRepo.findOneByUserIdOrThrow(receiver.userId.value)

  const res = found.askNewLoginToken()
  if (res.isErr) {
    return Result.err(res.error)
  }
  await employeeRepo.save(found)

  return Result.ok(true)
}
