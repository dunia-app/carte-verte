import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationStatus } from '../../domain/entities/organization.types'
import { OrganizationStatusQuery } from './organization-status.query'

// To delete : replaced by organizationInfo.status
@ObjectType()
class OrganizationStatusResponse extends ErrorWithResponse(
  [],
  'OrganizationStatusErrorUnion',
  OrganizationStatus,
) {}

@Resolver()
export class OrganizationStatusGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  // TO do throttle
  @AppQuery(() => OrganizationStatusResponse, UserRoles.organizationAdmin)
  async organizationStatus(
    @CurrentOrganizationId() organizationId: string,
  ): Promise<OrganizationStatusResponse> {
    const query = new OrganizationStatusQuery({
      organizationId: organizationId,
    })
    const res = await this.queryBus.execute(query)
    return new OrganizationStatusResponse(res)
  }
}
