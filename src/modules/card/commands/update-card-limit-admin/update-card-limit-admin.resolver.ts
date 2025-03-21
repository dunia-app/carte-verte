import { CommandBus } from '@nestjs/cqrs'
import { Args, Int, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { UpdateCardLimitAdminCommand } from './update-card-limit-admin.command'
import { UpdateCardLimitAdminRequest } from './update-card-limit-admin.request.dto'

@ObjectType()
class UpdateCardLimitAdminResponse extends ErrorWithResponse(
  [],
  'UpdateCardLimitAdminErrorUnion',
  Int,
) {}

@Resolver()
export class UpdateCardLimitAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UpdateCardLimitAdminResponse, UserRoles.superAdmin)
  async updateCardLimitAdmin(
    @Args('input') input: UpdateCardLimitAdminRequest,
  ): Promise<UpdateCardLimitAdminResponse> {
    const command = new UpdateCardLimitAdminCommand({
      limitPaymentDay: input.limitPaymentDay,
      paymentDailyLimit: input.paymentDailyLimit,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateCardLimitAdminResponse(res)
  }
}
