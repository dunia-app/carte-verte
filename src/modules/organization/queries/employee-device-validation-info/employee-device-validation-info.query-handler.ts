import { QueryHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { EmployeeRepository } from '../../../../modules/organization/database/employee/employee.repository'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeDeviceValidationResponse } from '../../dtos/employee.response.dto'
import {
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { EmployeeDeviceValidationInfoQuery } from './employee-device-validation-info.query'

@QueryHandler(EmployeeDeviceValidationInfoQuery)
export class EmployeeDeviceValidationInfoQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly receiverRepo: ReceiverRepository,
    private readonly baas: Baas,
    private readonly unitOfWork: UnitOfWork,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves employees directly from a repository.
   */
  async handle(
    query: EmployeeDeviceValidationInfoQuery,
  ): Promise<
    Result<
      EmployeeDeviceValidationResponse,
      EmployeeNotActivatedError | EmployeeNotFoundError
    >
  > {
    try {
      const receiver = await this.receiverRepo.findOneByEmailOrThrow(
        query.email,
      )
      const employee = await this.employeeRepo.findOneByUserIdOrThrow(
        receiver.userId.value,
      )
      if (employee.status === EmployeeStatus.EMPLOYEE_ACTIVE) {
        // Until all receivers have their phone number in our database
        if (!receiver.phoneNumber && query.addPhoneNumber) {
          const baasUser = await this.baas.getUser(employee.externalEmployeeId!)
          if (baasUser.isOk) {
            const receiverRepo = this.unitOfWork.getReceiverRepository(
              query.correlationId,
            )
            receiver.phoneNumber = baasUser.value.mobile
            await receiverRepo.save(receiver)
          }
        }
        return Result.ok(
          new EmployeeDeviceValidationResponse({
            phoneNumber: receiver.phoneNumber,
            email: receiver.email.value,
          }),
        )
      }
      return Result.err(new EmployeeNotActivatedError())
    } catch (e) {
      if (e instanceof NotFoundException) {
        return Result.err(new EmployeeNotFoundError(e))
      } else {
        throw e
      }
    }
  }
}
