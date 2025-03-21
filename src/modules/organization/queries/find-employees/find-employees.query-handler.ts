import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { DataWithPaginationMeta } from '../../../../libs/ddd/domain/ports/repository.ports'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepository } from '../../../../modules/organization/database/employee/employee.repository'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'
import { FindEmployeesQuery } from './find-employees.query'

@QueryHandler(FindEmployeesQuery)
export class FindEmployeesQueryHandler extends QueryHandlerBase {
  constructor(private readonly employeeRepo: EmployeeRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves employees directly from a repository.
   */
  async handle(
    query: FindEmployeesQuery,
  ): Promise<
    Result<DataWithPaginationMeta<FindEmployeeResponseProps[]>, ExceptionBase>
  > {
    const employees = await this.employeeRepo.findManyWithInfoByOrganizationId(
      query.organizationId,
      query.limit,
      query.offset,
      query.searchTerms,
    )
    return Result.ok(employees)
  }
}
