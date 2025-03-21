import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { WrongPinError } from '../../../../libs/ddd/domain/ports/baas.port'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
} from '../../errors/card.errors'
import { ChangePinCommand } from './change-pin.command'
import { ChangePinRequest } from './change-pin.request.dto'

@ObjectType()
class ChangePinResponse extends ErrorWithResponse(
  [CardPinAlreadySetError, CardPinFormatNotCorrectError, WrongPinError],
  'ChangePinErrorUnion',
  Boolean,
) {}

@Resolver()
export class ChangePinGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => ChangePinResponse, UserRoles.employee, {
    description:
      'Used for updating card pin code. You need to know the current one for this',
  })
  async changePin(
    @Args('input') input: ChangePinRequest,
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<ChangePinResponse> {
    const command = new ChangePinCommand({
      employeeId: employee.id.value,
      currentPin: input.currentPin,
      newPin: input.newPin,
      confirmPin: input.confirmPin,
    })

    const res = await this.commandBus.execute(command)
    return new ChangePinResponse(res)
  }
}
