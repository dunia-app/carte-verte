import { QueryBus } from '@nestjs/cqrs'
import { Float, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CashbackSumQuery } from './cashback-sum.query'

@ObjectType()
class CashbackSumResponse extends ErrorWithResponse(
  [],
  'CashbackSumErrorUnion',
  Float,
) {}

@Resolver()
export class CashbackSumGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => CashbackSumResponse, UserRoles.employee)
  async cashbackSum(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<CashbackSumResponse> {
    const query = new CashbackSumQuery({
      employeeId: employee.id.value,
    })
    const res = await this.queryBus.execute(query)

    return new CashbackSumResponse(res)
  }
}
