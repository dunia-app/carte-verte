import { Result } from '@badrap/result'
import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { TransactionsResponse } from '../../../../modules/transaction/dtos/transaction.response.dto'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { FindTransactionsQuery } from './find-transactions.query'
import { FindTransactionsRequest } from './find-transactions.request.dto'

@ObjectType()
class FindTransactionsResponse extends ErrorWithResponse(
  [],
  'FindTransactionsErrorUnion',
  TransactionsResponse,
) {}

@Resolver()
export class FindTransactionsGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindTransactionsResponse, UserRoles.employee)
  async findTransactions(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: FindTransactionsRequest,
  ): Promise<FindTransactionsResponse> {
    const query = new FindTransactionsQuery({
      pagination: input.pagination,
      startDate: !isUndefined(input.startDate)
        ? new DateVO(input.startDate)
        : new DateVO(new Date()),
      employeeId: employee.id.value,
      status: input.status,
    })
    const result = await this.queryBus.execute(query)
    if (result.isErr) {
      return new FindTransactionsResponse(Result.err())
    } else {
      return new FindTransactionsResponse(Result.ok(result.value))
    }
  }
}
