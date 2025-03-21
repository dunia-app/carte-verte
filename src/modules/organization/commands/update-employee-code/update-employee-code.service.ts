import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { UpdateEmployeeCodeCommand } from './update-employee-code.command'

export async function updateEmployeeCode(
  command: UpdateEmployeeCodeCommand,
  unitOfWork: UnitOfWork,
  configService: ConfigService,
): Promise<
  Result<
    EmployeeLoginResp,
    | WrongEmployeeCodeError
    | EmployeeCodeTooManyFailedAttemptError
    | EmployeeCodeFormatNotCorrectError
    | EmployeeNotActivatedError
    | EmployeeFrozenError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)

  if (found.status === EmployeeStatus.EMPLOYEE_UNACTIVE) {
    return Result.err(new EmployeeNotActivatedError())
  }
  const isCodeOk = found.checkCode(command.currentCode)
  if (isCodeOk.isErr) {
    if (isCodeOk.error instanceof WrongEmployeeCodeError) {
      await employeeRepo.save(found)
    }
    return Result.err(isCodeOk.error)
  }
  const refreshToken = await found.setCode(
    command.newCode,
    configService.getSaltRound(),
  )
  if (refreshToken.isErr) {
    return Result.err(refreshToken.error)
  }

  await employeeRepo.save(found)
  return Result.ok({
    employeeId: found.id,
    refreshToken: refreshToken.unwrap(),
  })
}
