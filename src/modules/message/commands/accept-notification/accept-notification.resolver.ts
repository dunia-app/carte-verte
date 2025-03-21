import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { AcceptNotificationCommand } from './accept-notification.command'
import { AcceptNotificationRequest } from './accept-notification.request.dto'

@ObjectType()
class AcceptNotificationResponse extends ErrorWithResponse(
  [],
  'AcceptNotificationErrorUnion',
  Boolean,
) {}

@Resolver()
export class AcceptNotificationGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AcceptNotificationResponse, UserRoles.employee)
  async acceptNotification(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: AcceptNotificationRequest,
  ): Promise<AcceptNotificationResponse> {
    const command = new AcceptNotificationCommand({
      userId: employee.userId.value,
      acceptNotification: input.acceptNotification,
    })

    const res = await this.commandBus.execute(command)

    return new AcceptNotificationResponse(res)
  }
}
