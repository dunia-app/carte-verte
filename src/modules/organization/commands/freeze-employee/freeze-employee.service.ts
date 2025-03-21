import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { LockCardCommand } from '../../../card/commands/lock-card/lock-card.command'
import { lockCard } from '../../../card/commands/lock-card/lock-card.service'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeAlreadyFrozenError } from '../../errors/employee.errors'
import { FreezeEmployeeCommand } from './freeze-employee.command'

export async function freezeEmployee(
  command: FreezeEmployeeCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<true, EmployeeAlreadyFrozenError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)
  const res = found.freeze()

  if (res.isOk) {
    const lockCommand = new LockCardCommand({
      correlationId: command.correlationId,
      employeeId: command.employeeId,
    })
    await Promise.all([
      lockCard(lockCommand, unitOfWork, baas),
      employeeRepo.save(found),
    ])
  }
  return res
}
