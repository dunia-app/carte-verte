import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { SkipOrganizationIdCheck } from '../../../../libs/decorators/role.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminEntity } from '../../domain/entities/organization-admin.entity'
import { FindAccessibleOrganizationsResponse } from '../../dtos/organization.response.dto'
import { FindAccessibleOrganizationsQuery } from './find-accessible-organizations.query'

@ObjectType()
class FindAccessibleOrganizationsResponseError extends ErrorWithResponse(
  [],
  'AccessibleOrganizationsErrorUnion',
  FindAccessibleOrganizationsResponse,
) {}

@Resolver()
@SkipOrganizationIdCheck()
export class FindAccessibleOrganizationsGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}
  @AppQuery(
    () => FindAccessibleOrganizationsResponseError,
    UserRoles.organizationAdmin,
  )
  async findAccessibleOrganizations(
    @CurrentUser() organizationAdmin: OrganizationAdminEntity,
  ): Promise<FindAccessibleOrganizationsResponseError> {
    const query = new FindAccessibleOrganizationsQuery({
      organizationAdminId: organizationAdmin.id.value,
    })
    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new FindAccessibleOrganizationsResponseError(Result.err(res.error))
    }
    return new FindAccessibleOrganizationsResponseError(
      Result.ok(new FindAccessibleOrganizationsResponse(res.value)),
    )
  }
}
