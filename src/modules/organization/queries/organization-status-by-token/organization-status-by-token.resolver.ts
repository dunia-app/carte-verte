import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { OrganizationStatus } from '../../domain/entities/organization.types'
import { OrganizationIdIsMissingError } from '../../errors/organization-admin.errors'
import { OrganizationStatusByTokenQuery } from './organization-status-by-token.query'

// To delete : replaced by organizationInfo.status
@ObjectType()
class OrganizationStatusByTokenResponse extends ErrorWithResponse(
  [],
  'OrganizationStatusByTokenErrorUnion',
  OrganizationStatus,
) {}

@Resolver()
export class OrganizationStatusByTokenGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => OrganizationStatusByTokenResponse, false)
  async organizationStatusByToken(
    @CurrentOrganizationId() organizationId: string,
    @Args('token') token: string,
  ): Promise<OrganizationStatusByTokenResponse> {
    if (!organizationId) {
      return new OrganizationStatusByTokenResponse(
        Result.err(new OrganizationIdIsMissingError()),
      )
    }

    const query = new OrganizationStatusByTokenQuery({
      organizationId: organizationId,
      token: token,
    })
    const res = await this.queryBus.execute(query)
    return new OrganizationStatusByTokenResponse(res)
  }
}
