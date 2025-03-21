import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationInfoResponse } from '../../dtos/organization.response.dto'
import { OrganizationInfoQuery } from './organization-info.query'

@ObjectType()
class OrganizationInfoResponseError extends ErrorWithResponse(
  [],
  'OrganizationInfoResponseErrorUnion',
  OrganizationInfoResponse,
) {}

@Resolver()
export class OrganizationInfoGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => OrganizationInfoResponseError, UserRoles.organizationAdmin)
  async organizationInfo(
    @CurrentOrganizationId() organizationId: string,
  ): Promise<OrganizationInfoResponseError> {
    const query = new OrganizationInfoQuery({
      organizationId: organizationId,
    })
    const res = await this.queryBus.execute(query)
    return new OrganizationInfoResponseError(res)
  }
}
