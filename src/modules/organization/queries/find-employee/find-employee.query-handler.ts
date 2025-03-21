import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepository } from '../../database/employee/employee.repository'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'
import { FindEmployeeQuery } from './find-employee.query'

@QueryHandler(FindEmployeeQuery)
export class FindEmployeeQueryHandler extends QueryHandlerBase {
  constructor(private readonly employeeRepo: EmployeeRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves employee directly from a repository.
   */
  async handle(
    query: FindEmployeeQuery,
  ): Promise<Result<FindEmployeeResponseProps, ExceptionBase>> {
    const employee =
      await this.employeeRepo.findOneWithInfoByIdAndOrganizationIdOrThrow(
        query.employeeId,
        query.organizationId,
      )
    return Result.ok(employee)
  }
}
