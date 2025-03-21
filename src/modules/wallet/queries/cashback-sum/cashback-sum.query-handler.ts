import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { CashbackSumQuery } from './cashback-sum.query'

@QueryHandler(CashbackSumQuery)
export class CashbackSumQueryHandler extends QueryHandlerBase {
  constructor(private readonly employeeRepo: EmployeeRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves transfers directly from a repository.
   */
  async handle(
    query: CashbackSumQuery,
  ): Promise<Result<number, ExceptionBase>> {
    const cashbackAmount = await this.employeeRepo.employeeSumCashback(
      query.employeeId,
    )
    return Result.ok(cashbackAmount)
  }
}
