import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  OrganizationCoveragePercentIsIncorrectError,
  OrganizationMealTicketAmountIsIncorrectError,
  OrganizationMealTicketDayIsIncorrectError,
} from '../../errors/organization.errors'
import { SetMealTicketConfigCommand } from './set-meal-ticket-config.command'
import { SetMealTicketConfigRequest } from './set-meal-ticket-config.request.dto'

@ObjectType()
class SetMealTicketConfigResponse extends ErrorWithResponse(
  [
    OrganizationMealTicketAmountIsIncorrectError,
    OrganizationCoveragePercentIsIncorrectError,
    OrganizationMealTicketDayIsIncorrectError,
  ],
  'SetMealTicketConfigErrorUnion',
  String,
) {}

@Resolver()
export class SetMealTicketConfigGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => SetMealTicketConfigResponse, UserRoles.organizationAdmin)
  async setMealTicketConfig(
    @CurrentOrganizationId() organizationId: string,
    @Args('input') input: SetMealTicketConfigRequest,
  ): Promise<SetMealTicketConfigResponse> {
    const command = new SetMealTicketConfigCommand({
      organizationId: organizationId,
      coveragePercent: input.coveragePercent,
      mealTicketAmount: input.mealTicketAmount,
      mealTicketDay: input.mealTicketDay,
      mealTicketAutoRenew: input.mealTicketAutoRenew,
      physicalCardCoverage: input.physicalCardCoverage,
      firstPhysicalCardCoverage: input.firstPhysicalCardCoverage,
    })

    const res = await this.commandBus.execute(command)

    return new SetMealTicketConfigResponse(res)
  }
}
