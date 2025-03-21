import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { OffsetPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { FindEmployeesResponse } from '../../../../modules/organization/dtos/employee.response.dto'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { FindEmployeesQuery } from './find-employees.query'
import { FindEmployeesRequest } from './find-employees.request.dto'

@ObjectType()
class FindEmployeesResponseError extends ErrorWithResponse(
  [],
  'FindEmployeesErrorUnion',
  FindEmployeesResponse,
) {}

@Resolver()
export class FindEmployeesGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindEmployeesResponseError, UserRoles.organizationAdmin)
  async findEmployees(
    @CurrentOrganizationId() organizationId: string,
    @Args('pagination') pagination: OffsetPaginationBase,
    @Args('input', { nullable: true }) input?: FindEmployeesRequest,
  ): Promise<FindEmployeesResponseError> {
    const query = new FindEmployeesQuery({
      organizationId: organizationId,
      limit: pagination.limit ? pagination.limit : 20,
      offset: pagination.offset ? pagination.offset : 0,
      searchTerms: input?.searchTerms,
    })

    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new FindEmployeesResponseError(Result.err(res.error))
    }
    return new FindEmployeesResponseError(
      Result.ok(new FindEmployeesResponse(res.value)),
    )
  }
}
