import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { OrganizationAdminStatus } from '../../domain/entities/organization-admin.types'
import { OrganizationAdminStatusQuery } from './organization-admin-status.query'

@ObjectType()
class OrganizationAdminStatusResponse extends ErrorWithResponse(
  [],
  'OrganizationAdminStatusErrorUnion',
  OrganizationAdminStatus,
) {}

@Resolver()
export class OrganizationAdminStatusGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  // TO do throttle
  @AppQuery(() => OrganizationAdminStatusResponse, false)
  async organizationAdminStatus(
    @Args('email') email: string,
  ): Promise<OrganizationAdminStatusResponse> {
    const query = new OrganizationAdminStatusQuery({
      email: email,
    })
    const res = await this.queryBus.execute(query)
    return new OrganizationAdminStatusResponse(res)
  }
}
