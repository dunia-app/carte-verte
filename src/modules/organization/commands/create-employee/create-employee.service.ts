import { findDuplicates } from '../../../../helpers/object.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { EmailNotValideError } from '../../../../libs/ddd/domain/value-objects/email.error'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { ReceiverEntity } from '../../../message/domain/entities/receiver.entity'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { UserEntity } from '../../../user/domain/entities/user.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { Name } from '../../../user/domain/value-objects/name.value-object'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import { BooleanByWeekday } from '../../domain/value-objects/boolean-by-weekday.value-object'
import {
  EmployeeAlreadyExistsError,
  EmployeeEmailDuplicatedError,
  EmployeeNameNotValideError,
} from '../../errors/employee.errors'
import {
  CreateEmployeeCommand,
  CreateEmployeeRes,
} from './create-employee.command'

export async function createEmployee(
  command: CreateEmployeeCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<CreateEmployeeRes[], ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
    (including changes caused by Domain Events) into one 
    atomic database transaction */

  const userRepo: UserRepositoryPort = unitOfWork.getUserRepository(
    command.correlationId,
  )
  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )

  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )

  const result: CreateEmployeeRes[] = []
  const userToCreate: UserEntity[] = []
  const receiverToCreate: ReceiverEntity[] = []
  const employeeToCreate: EmployeeEntity[] = []

  const employeeEmails = command.employeeCommand.map(
    (employee) => employee.email,
  )
  const duplicates = findDuplicates(employeeEmails)
  if (duplicates.length !== 0) {
    result.push(
      ...duplicates.map((email: string) => {
        return {
          email,
          res: Result.err(
            new EmployeeEmailDuplicatedError(duplicates.toString()),
          ),
        }
      }),
    )
  }
  const nonDuplicateEmployees = command.employeeCommand.filter(
    (employee) => duplicates.indexOf(employee.email) === -1,
  )

  const existingReceivers = await receiverRepo.findManyByEmails(
    nonDuplicateEmployees.map((employee) => employee.email),
  )

  await Promise.all(
    nonDuplicateEmployees.map(async (employeeProps) => {
      const existingReceiver = existingReceivers.find(
        (receiver) => receiver.email.value === employeeProps.email,
      )
      if (existingReceiver) {
        const existingEmployee = await employeeRepo.findOneByUserId(
          existingReceiver.userId.value,
        )
        // If employee exists, is to be deleted and has the same email and name
        // Then it must be a mistake and we "unremove" the employee
        // Else the email must be wrong
        if (!isUndefined(existingEmployee)) {
          if (existingEmployee.willBeDeleted) {
            const user = await userRepo.findOneByIdOrThrow(
              existingReceiver.userId,
            )
            if (
              employeeProps.firstname === user.name.firstname &&
              employeeProps.lastname === user.name.lastname
            ) {
              existingEmployee.unremove()
              employeeRepo.save(existingEmployee)
              return
            }
          }
          result.push({
            email: employeeProps.email,
            res: Result.err(
              new EmployeeAlreadyExistsError(employeeProps.email),
            ),
          })
          return
        }
      }
      try {
        // checking if name is validated
        new Name({
          firstname: employeeProps.firstname,
          lastname: employeeProps.lastname,
        })
      } catch (e) {
        result.push({
          email: employeeProps.email,
          res: Result.err(new EmployeeNameNotValideError(employeeProps.email)),
        })
        return
      }

      try {
        // checking if email is validated
        new Email(employeeProps.email)
      } catch (e) {
        result.push({
          email: employeeProps.email,
          res: Result.err(new EmailNotValideError(employeeProps.email)),
        })
        return
      }

      const user = UserEntity.create({
        name: new Name({
          firstname: employeeProps.firstname,
          lastname: employeeProps.lastname,
        }),
        role: UserRoles.employee,
      })

      const receiver = ReceiverEntity.create({
        userId: user.id,
        email: new Email(employeeProps.email),
      })

      const employee = EmployeeEntity.create({
        organizationId: new UUID(employeeProps.organizationId),
        userId: isUndefined(existingReceiver)
          ? user.id
          : existingReceiver.userId,
        mealTicketDays: new BooleanByWeekday(employeeProps.mealTicketDays),
        birthday: new DateVO(employeeProps.birthday),
        defaultAuthorizedOverdraft: employeeProps.defaultAuthorizedOverdraft,
      })
      if (isUndefined(existingReceiver)) {
        userToCreate.push(user)
        receiverToCreate.push(receiver)

        result.push({
          email: receiver.email.value,
          res: Result.ok(employee.id),
        })
      } else {
        result.push({
          email: existingReceiver.email.value,
          res: Result.ok(employee.id),
        })
      }
      employeeToCreate.push(employee)
    }),
  )

  await Promise.all([
    userRepo.saveMultiple(userToCreate),
    receiverRepo.saveMultiple(receiverToCreate),
    employeeRepo.saveMultiple(employeeToCreate),
  ])

  return Result.ok(result)
}
