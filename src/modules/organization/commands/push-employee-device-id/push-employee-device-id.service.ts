import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { PushEmployeeDeviceIdCommand } from './push-employee-device-id.command'

export async function pushEmployeeDeviceId(
  command: PushEmployeeDeviceIdCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<string, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const employee = await employeeRepo.findOneByIdOrThrow(command.employeeId)
  if (employee.pushDeviceIds(command.deviceId).isOk) {
    await employeeRepo.save(employee)
  }

  return Result.ok(command.deviceId)
}
