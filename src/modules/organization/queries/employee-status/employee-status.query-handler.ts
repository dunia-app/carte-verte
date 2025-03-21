import { QueryHandler } from '@nestjs/cqrs'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { CardAcquisitionRepository } from '../../../wallet/database/card-acquisition/card-acquisition.repository'
import { EmployeeRepository } from '../../database/employee/employee.repository'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeNotFoundError } from '../../errors/employee.errors'
import { EmployeeStatusQuery } from './employee-status.query'

@QueryHandler(EmployeeStatusQuery)
export class EmployeeStatusQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly receiverRepo: ReceiverRepository,
    private readonly cardAcquisitionRepo: CardAcquisitionRepository,
    private readonly redis: RedisService,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves employees directly from a repository.
   */
  async handle(
    query: EmployeeStatusQuery,
  ): Promise<Result<EmployeeStatus, EmployeeNotFoundError>> {
    try {
      const receiver = await this.receiverRepo.findOneByEmailOrThrow(
        query.email,
      )
      const employee = await this.employeeRepo.findOneByUserIdOrThrow(
        receiver.userId.value,
      )
      if (employee.status === EmployeeStatus.EMPLOYEE_ACTIVE) {
        //Check for code reset requets
        const cacheResult = await this.redis.persist.get(query.email)
        if (cacheResult || employee.hasFailedCodeTooManyTimes) {
          return Result.ok(EmployeeStatus.EMPLOYEE_ACTIVE_RESET_CODE)
        }
        if (!employee.hasAcceptedCgu) {
          return Result.ok(EmployeeStatus.EMPLOYEE_NO_CGU)
        }
        if (query.deviceId && employee.pushDeviceIds(query.deviceId).isOk) {
          return Result.ok(EmployeeStatus.EMPLOYEE_ACTIVE_NEW_DEVICE)
        }
        const cardAcquisition =
          await this.cardAcquisitionRepo.findOneActiveByEmployeeId(
            employee.id.value,
          )
        if (!cardAcquisition) {
          return Result.ok(EmployeeStatus.EMPLOYEE_NO_CARD_ACQUISITION)
        }
      }
      return Result.ok(employee.status)
    } catch (e) {
      if (e instanceof NotFoundException) {
        return Result.err(new EmployeeNotFoundError(e))
      } else {
        throw e
      }
    }
  }
}
