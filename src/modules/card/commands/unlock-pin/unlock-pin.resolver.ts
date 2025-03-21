import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { UnlockPinCommand } from './unlock-pin.command'

@ObjectType()
class UnlockPinResponse extends ErrorWithResponse(
  [],
  'UnlockPinErrorUnion',
  Boolean,
) {}

@Resolver()
export class UnlockPinGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UnlockPinResponse, UserRoles.employee)
  async unlockPin(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<UnlockPinResponse> {
    const command = new UnlockPinCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new UnlockPinResponse(res)
  }
}
