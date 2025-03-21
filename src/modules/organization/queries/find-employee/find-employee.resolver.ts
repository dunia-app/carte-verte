import { ParseUUIDPipe } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { FindEmployeeResponse } from '../../dtos/employee.response.dto'
import { EmployeeNotFoundError } from '../../errors/employee.errors'
import { FindEmployeeQuery } from './find-employee.query'

@ObjectType()
class FindEmployeeResponseError extends ErrorWithResponse(
  [EmployeeNotFoundError],
  'FindEmployeeErrorUnion',
  FindEmployeeResponse,
) {}

@Resolver()
export class FindEmployeeGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindEmployeeResponseError, UserRoles.organizationAdmin)
  async findEmployee(
    @Args('employeeId', ParseUUIDPipe) employeeId: string,
    @CurrentOrganizationId() organizationId: string,
  ): Promise<FindEmployeeResponseError> {
    const query = new FindEmployeeQuery({
      organizationId: organizationId,
      employeeId: employeeId,
    })

    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new FindEmployeeResponseError(Result.err(res.error))
    }
    return new FindEmployeeResponseError(
      Result.ok(new FindEmployeeResponse(res.value)),
    )
  }
}
