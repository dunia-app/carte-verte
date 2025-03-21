import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { DistributeCashbackAdminCommand } from './distribute-cashback-admin.command'
import { DistributeCashbackAdminRequest } from './distribute-cashback-admin.request.dto'

@ObjectType()
class DistributeCashbackAdminResponse extends ErrorWithResponse(
  [],
  'distributeCashbackAdminErrorUnion',
  Number,
) {}

@Resolver()
export class DistributeCashbackAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => DistributeCashbackAdminResponse, UserRoles.employee)
  async distributeCashbackAdmin(
    @Args('input') input: DistributeCashbackAdminRequest,
  ): Promise<DistributeCashbackAdminResponse> {
    const command = new DistributeCashbackAdminCommand({
      transactionId: input.transactionId,
    })

    const res = await this.commandBus.execute(command)

    return new DistributeCashbackAdminResponse(res)
  }
}
