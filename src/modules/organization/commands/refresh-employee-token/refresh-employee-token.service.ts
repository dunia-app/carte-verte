import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeRefreshTokenError,
} from '../../errors/employee.errors'
import { RefreshEmployeeTokenCommand } from './refresh-employee-token.command'

export async function refreshEmployeeToken(
  command: RefreshEmployeeTokenCommand,
  unitOfWork: UnitOfWork,
  config: ConfigService,
): Promise<
  Result<
    EmployeeLoginResp,
    EmployeeRefreshTokenError | EmployeeNotActivatedError | EmployeeFrozenError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)
  const refreshToken = found.refreshToken(
    command.refreshToken,
    config.getSaltRound(),
    command.deviceId,
  )
  if (refreshToken.isErr) {
    return Result.err(refreshToken.error)
  }

  await employeeRepo.save(found)
  return Result.ok({
    employeeId: found.id,
    refreshToken: refreshToken.value,
  })
}
