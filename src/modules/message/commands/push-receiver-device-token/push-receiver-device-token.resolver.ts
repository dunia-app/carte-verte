import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import {
  CurrentDeviceId,
  CurrentUser,
} from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { PushReceiverDeviceTokenCommand } from './push-receiver-device-token.command'

@ObjectType()
class PushReceiverDeviceTokenResponse extends ErrorWithResponse(
  [],
  'PushReceiverDeviceTokenErrorUnion',
  String,
) {}

@Resolver()
export class PushReceiverDeviceTokenGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => PushReceiverDeviceTokenResponse, UserRoles.employee)
  async pushDeviceToken(
    @CurrentUser() employee: EmployeeEntity,
    @CurrentDeviceId() deviceId: string,
    @Args('deviceToken') deviceToken: string,
  ): Promise<PushReceiverDeviceTokenResponse> {
    const command = new PushReceiverDeviceTokenCommand({
      userId: employee.userId.value,
      deviceToken: deviceToken,
      deviceId: deviceId,
    })

    const res = await this.commandBus.execute(command)

    return new PushReceiverDeviceTokenResponse(res)
  }
}
