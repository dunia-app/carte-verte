import { UnauthorizedException } from '@nestjs/common'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import {
  DashboardName,
  DataVisualizerError,
} from '../../../libs/ddd/domain/ports/data-visualizer.port'
import { ErrorWithResponse } from '../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../modules/user/domain/entities/user.types'
import { DataVisualizer } from '../data-visualizer'

@ObjectType()
class EmbeddedDashboardUrlResponse extends ErrorWithResponse(
  [DataVisualizerError],
  'EmbeddedDashboardUrlErrorUnion',
  String,
) {}

@Resolver()
export class EmbeddedDashboardUrlResolver {
  constructor(private readonly service: DataVisualizer) {}

  @AppQuery(() => EmbeddedDashboardUrlResponse, UserRoles.organizationAdmin)
  async embeddedDashboardUrlOrganization(
    @Args('dashboard') dashboard: DashboardName,
    @CurrentOrganizationId() organizationId: string,
  ): Promise<EmbeddedDashboardUrlResponse> {
    if (
      dashboard != DashboardName.ORGANIZATION_OVERVIEW &&
      dashboard != DashboardName.ORGANIZATION_IMPACT_OVERVIEW
    ) {
      throw new UnauthorizedException('This dashboard is not accessible by you')
    }
    const res = await this.service.getEmbeddedDashboardUrl(dashboard, {
      id: organizationId,
    })
    return new EmbeddedDashboardUrlResponse(res)
  }
}
