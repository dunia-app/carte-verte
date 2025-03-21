import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UnlockCardCommand } from '../../../card/commands/unlock-card/unlock-card.command'
import { unlockCard } from '../../../card/commands/unlock-card/unlock-card.service'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeAlreadyUnfrozenError } from '../../errors/employee.errors'
import { UnfreezeEmployeeCommand } from './unfreeze-employee.command'

export async function unfreezeEmployee(
  command: UnfreezeEmployeeCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<true, EmployeeAlreadyUnfrozenError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const found = await employeeRepo.findOneByIdOrThrow(command.employeeId)
  const res = found.unfreeze()

  if (res.isOk) {
    const unlockCommand = new UnlockCardCommand({
      correlationId: command.correlationId,
      employeeId: command.employeeId,
    })
    await Promise.all([
      unlockCard(unlockCommand, unitOfWork, baas),
      employeeRepo.save(found),
    ])
  }
  return res
}
