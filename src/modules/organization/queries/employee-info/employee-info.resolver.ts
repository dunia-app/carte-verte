import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import { FindEmployeeResponse } from '../../dtos/employee.response.dto'
import { EmployeeInfoQuery } from './employee-info.query'

@ObjectType()
class EmployeeInfoResponse extends ErrorWithResponse(
  [],
  'EmployeeInfoErrorUnion',
  FindEmployeeResponse,
) {}

@Resolver()
export class EmployeeInfoGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => EmployeeInfoResponse, UserRoles.employee)
  async employeeInfo(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<EmployeeInfoResponse> {
    const query = new EmployeeInfoQuery({
      userId: employee.userId.value,
    })

    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new EmployeeInfoResponse(Result.err(res.error))
    }
    return new EmployeeInfoResponse(
      Result.ok(new FindEmployeeResponse(res.value)),
    )
  }
}
