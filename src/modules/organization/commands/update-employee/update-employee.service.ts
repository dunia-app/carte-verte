import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { UpdateBaasUserProps } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { Name } from '../../../user/domain/value-objects/name.value-object'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeNotFoundError } from '../../errors/employee.errors'
import { UpdateEmployeeCommand } from './update-employee.command'

export async function updateEmployee(
  command: UpdateEmployeeCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<string, EmployeeNotFoundError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )
  const userRepo: UserRepositoryPort = unitOfWork.getUserRepository(
    command.correlationId,
  )

  const employee = await employeeRepo.findOneById(command.employeeId)
  if (!employee) {
    return Result.err(new EmployeeNotFoundError())
  }
  const baasEmployee: UpdateBaasUserProps = {}

  const updateUser = async () => {
    if (command.firstname || command.lastname) {
      const user = await userRepo.findOneByIdOrThrow(employee.userId.value)
      user.name = new Name({
        firstname: command.firstname ? command.firstname : user.name.firstname,
        lastname: command.lastname ? command.lastname : user.name.lastname,
      })
      baasEmployee.firstname = user.name.firstname
      baasEmployee.lastname = user.name.lastname
      await userRepo.save(user)
    }
  }
  await Promise.all([updateUser()])
  if (Object.keys(baasEmployee).length > 0) {
    baas.updateEmployee(employee.externalEmployeeId!, baasEmployee)
  }

  return Result.ok(employee.id.value)
}
