import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { ResetPinCommand } from './reset-pin.command'
import { ResetPinRequest } from './reset-pin.request.dto'

@ObjectType()
class ResetPinResponse extends ErrorWithResponse(
  [CardPinNotSetError, CardPinFormatNotCorrectError],
  'ResetPinErrorUnion',
  Boolean,
) {}

@Resolver()
export class ResetPinGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => ResetPinResponse, UserRoles.employee, {
    description:
      'Used to reset card pin code, in case it is forgotten. Card will need to be use in a atm afterwards',
  })
  async resetPin(
    @Args('input') input: ResetPinRequest,
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<ResetPinResponse> {
    const command = new ResetPinCommand({
      employeeId: employee.id.value,
      newPin: input.newPin,
      confirmPin: input.confirmPin,
    })

    const res = await this.commandBus.execute(command)
    return new ResetPinResponse(res)
  }
}
