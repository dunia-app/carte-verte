import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { MealTicketConfigResponse } from '../../dtos/organization.response.dto'
import { OrganizationHasNoSettingsError } from '../../errors/organization.errors'
import { MealTicketConfigQuery } from './meal-ticket-config.query'

// To delete : replaced by organizationInfo.mealTicketConfig
@ObjectType()
class OrganizationMealTicketConfigResponseError extends ErrorWithResponse(
  [OrganizationHasNoSettingsError],
  'MealTicketConfigErrorUnion',
  MealTicketConfigResponse,
) {}

@Resolver()
export class MealTicketConfigGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(
    () => OrganizationMealTicketConfigResponseError,
    UserRoles.organizationAdmin,
  )
  async mealTicketConfig(
    @CurrentOrganizationId() organizationId: string,
  ): Promise<OrganizationMealTicketConfigResponseError> {
    const query = new MealTicketConfigQuery({
      organizationId: organizationId,
    })
    const res = await this.queryBus.execute(query)

    return new OrganizationMealTicketConfigResponseError(res)
  }
}
