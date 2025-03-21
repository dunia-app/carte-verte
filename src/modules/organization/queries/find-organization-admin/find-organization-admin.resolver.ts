import { ParseUUIDPipe } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { FindOrganizationAdminResponse } from '../../dtos/organization-admin.response.dto'
import { FindOrganizationAdminQuery } from './find-organization-admin.query'

@ObjectType()
class FindOrganizationAdminResponseError extends ErrorWithResponse(
  [],
  'FindOrganizationAdminErrorUnion',
  FindOrganizationAdminResponse,
) {}

@Resolver()
export class FindOrganizationAdminGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(
    () => FindOrganizationAdminResponseError,
    UserRoles.organizationAdmin,
  )
  async findOrganizationAdmin(
    @Args('organizationAdminId', ParseUUIDPipe)
    organizationAdminId: string,
    @CurrentOrganizationId() organizationId: string,
  ): Promise<FindOrganizationAdminResponseError> {
    const query = new FindOrganizationAdminQuery({
      organizationId: organizationId,
      organizationAdminId: organizationAdminId,
    })

    const res = await this.queryBus.execute(query)

    if (res.isErr) {
      return new FindOrganizationAdminResponseError(Result.err(res.error))
    }
    return new FindOrganizationAdminResponseError(
      Result.ok(new FindOrganizationAdminResponse(res.value)),
    )
  }
}
