import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AskEmployeeDeviceValidationTokenCommand } from './ask-employee-device-validation-token.command'
import { AskEmployeeDeviceValidationTokenRequest } from './ask-employee-device-validation-token.request.dto'

@ObjectType()
class AskEmployeeDeviceValidationTokenResponse extends ErrorWithResponse(
  [],
  'AskEmployeeDeviceValidationTokenErrorUnion',
  String,
) {}

@Resolver()
export class AskEmployeeDeviceValidationTokenGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskEmployeeDeviceValidationTokenResponse, false)
  async askEmployeeDeviceValidationToken(
    @Args('input') input: AskEmployeeDeviceValidationTokenRequest,
  ): Promise<AskEmployeeDeviceValidationTokenResponse> {
    const command = new AskEmployeeDeviceValidationTokenCommand({
      email: input.email,
      deviceId: input.deviceId,
      method: input.method,
    })

    const res = await this.commandBus.execute(command)

    return new AskEmployeeDeviceValidationTokenResponse(res)
  }
}
