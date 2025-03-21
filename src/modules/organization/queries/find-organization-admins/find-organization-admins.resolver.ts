import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { OffsetPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { FindOrganizationAdminsResponse } from '../../dtos/organization-admin.response.dto'
import { FindOrganizationAdminsQuery } from './find-organization-admins.query'

@ObjectType()
class FindOrganizationAdminsResponseError extends ErrorWithResponse(
  [],
  'FindOrganizationAdminsErrorUnion',
  FindOrganizationAdminsResponse,
) {}

@Resolver()
export class FindOrganizationAdminsGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(
    () => FindOrganizationAdminsResponseError,
    UserRoles.organizationAdmin,
  )
  async findOrganizationAdmins(
    @Args('pagination') pagination: OffsetPaginationBase,
    @CurrentOrganizationId() organizationId: string,
  ): Promise<FindOrganizationAdminsResponseError> {
    const query = new FindOrganizationAdminsQuery({
      organizationId: organizationId,
      limit: pagination.limit ? pagination.limit : 20,
      offset: pagination.offset ? pagination.offset : 0,
    })

    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new FindOrganizationAdminsResponseError(Result.err(res.error))
    }
    return new FindOrganizationAdminsResponseError(
      Result.ok(new FindOrganizationAdminsResponse(res.value)),
    )
  }
}
