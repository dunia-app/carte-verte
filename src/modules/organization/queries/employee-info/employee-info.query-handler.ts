import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepository } from '../../../../modules/organization/database/employee/employee.repository'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'
import { EmployeeInfoQuery } from './employee-info.query'

@QueryHandler(EmployeeInfoQuery)
export class EmployeeInfoQueryHandler extends QueryHandlerBase {
  constructor(private readonly employeeRepo: EmployeeRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves employees directly from a repository.
   */
  async handle(
    query: EmployeeInfoQuery,
  ): Promise<Result<FindEmployeeResponseProps, ExceptionBase>> {
    const employee = await this.employeeRepo.findOneWithInfoByUserIdOrThrow(
      query.userId,
    )
    return Result.ok(employee)
  }
}
