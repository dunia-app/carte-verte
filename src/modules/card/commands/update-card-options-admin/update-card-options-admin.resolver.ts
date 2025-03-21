import { CommandBus } from '@nestjs/cqrs'
import { Args, Int, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { UpdateCardOptionsAdminCommand } from './update-card-options-admin.command'
import { UpdateCardOptionsAdminRequest } from './update-card-options-admin.request.dto'

@ObjectType()
class UpdateCardOptionsAdminResponse extends ErrorWithResponse(
  [],
  'UpdateCardOptionsAdminErrorUnion',
  Int,
) {}

@Resolver()
export class UpdateCardOptionsAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UpdateCardOptionsAdminResponse, UserRoles.superAdmin)
  async updateCardOptionsAdmin(
    @Args('input') input: UpdateCardOptionsAdminRequest,
  ): Promise<UpdateCardOptionsAdminResponse> {
    const command = new UpdateCardOptionsAdminCommand({
      foreign: input.foreign,
      nfc: input.nfc,
      online: input.online,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateCardOptionsAdminResponse(res)
  }
}
