import moment = require('moment')
import { logger, pauseExec } from '../../../../helpers/application.helper'
import {
  objectArrayToMap,
  objectArrayToObjectArrayKey,
} from '../../../../helpers/object.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { WalletRepositoryPort } from '../../../wallet/database/wallet/wallet.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import { DeleteEmployeesCommand } from './delete-employees.command'

const batchSize = 5000

export async function deleteEmployees(
  command: DeleteEmployeesCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<Result<null, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )
  const userRepo: UserRepositoryPort = unitOfWork.getUserRepository(
    command.correlationId,
  )
  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  const lessThanDate = moment().add(5, 'seconds').toDate()
  const total = await employeeRepo.employeesToBeDeletedCount(lessThanDate)
  if (total === 0) return Result.ok(null)

  const employeeToBeDeleted: EmployeeEntity[] = []
  let employeeDeleted = 0

  for (let batchI = 0; batchI < total; batchI += batchSize) {
    const employees = await employeeRepo.employeesToBeDeleted(
      lessThanDate,
      batchSize,
    )

    const [users, receivers, wallets] = await Promise.all([
      objectArrayToMap(
        await userRepo.findManyById(
          employees.map((employee) => employee.userId),
        ),
        'id',
        (user) => user.id.value,
      ),
      objectArrayToMap(
        await receiverRepo.findManyByUserIds(
          employees.map((employee) => employee.userId.value),
        ),
        'userId',
        (receiver) => receiver.userId.value,
      ),
      objectArrayToObjectArrayKey(
        await walletRepo.findManyByEmployeeIds(
          employees.map((employee) => employee.id.value),
        ),
        'employeeId',
      ),
    ])

    employees.map((employee) => {
      const user = users.get(employee.userId.value)!
      const receiver = receivers.get(employee.userId.value)!
      const subwallets = wallets[employee.id.value]

      let balanceTotal = 0
      let authorizedBalanceTotal = 0

      subwallets.map((subwallet) => {
        balanceTotal += subwallet.balance
        authorizedBalanceTotal += subwallet.authorizedBalance
      })

      if (
        employee.delete(user!.name, balanceTotal, authorizedBalanceTotal).isOk
      ) {
        if (employee.externalEmployeeId) {
          baas.deleteUser(
            employee.externalEmployeeId,
            deletedEmailForBaas(receiver.email.value),
          )
        }
        employeeToBeDeleted.push(employee)
      }
    })
    employeeDeleted += (await employeeRepo.delete(employeeToBeDeleted)).length
    await userRepo.deleteById(
      employeeToBeDeleted
        .filter((employee) => {
          // delete user only if user is only an employee
          const user = users.get(employee.userId.value)!
          return user.role === UserRoles.employee
        })
        .map((employee) => employee.userId),
    )
    await pauseExec()
  }
  if (employeeDeleted > 0) {
    logger.log(`${employeeDeleted} employees successfully deleted`)
  }

  return Result.ok(null)
}

// email to be changed to avoid conflict with baas
function deletedEmailForBaas(email: string) {
  return email.replace('@', '+deleted@')
}
