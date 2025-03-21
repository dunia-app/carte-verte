import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import {
  EmployeeAlreadyActivatedError,
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { AskNewEmployeeSmsTokenCommand } from './ask-new-employee-sms-token.command'
import { AskNewEmployeeSmsTokenRequest } from './ask-new-employee-sms-token.request.dto'

@ObjectType()
class AskNewEmployeeSmsTokenResponse extends ErrorWithResponse(
  [EmployeeAlreadyActivatedError, EmployeeFrozenError, EmployeeNotFoundError],
  'AskNewEmployeeSmsTokenErrorUnion',
  String,
) {}

@Resolver()
export class AskNewEmployeeSmsTokenGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskNewEmployeeSmsTokenResponse, false)
  async askNewEmployeeSmsToken(
    @Args('input') input: AskNewEmployeeSmsTokenRequest,
  ): Promise<AskNewEmployeeSmsTokenResponse> {
    const command = new AskNewEmployeeSmsTokenCommand({
      email: input.email,
      mobile: input.mobile,
      deviceId: input.deviceId,
    })

    const res = await this.commandBus.execute(command)
    return new AskNewEmployeeSmsTokenResponse(res)
  }
}
