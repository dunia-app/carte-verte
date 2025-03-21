import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import {
  EmployeeAlreadyActivatedError,
  EmployeeFrozenError,
} from '../../errors/employee.errors'
import { AskNewEmployeeLoginTokenCommand } from './ask-new-employee-login-token.command'
const Sentry = require('@sentry/node')

@ObjectType()
class AskNewEmployeeLoginTokenResponse extends ErrorWithResponse(
  [EmployeeAlreadyActivatedError, EmployeeFrozenError],
  'AskNewEmployeeLoginTokenErrorUnion',
  Boolean,
) {}

@Resolver()
export class AskNewEmployeeLoginTokenGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskNewEmployeeLoginTokenResponse, false)
  async askNewEmployeeLoginToken(
    @Args('email') email: string,
  ): Promise<AskNewEmployeeLoginTokenResponse> {
    Sentry.setUser({
      email: email
    })

    const command = new AskNewEmployeeLoginTokenCommand({
      email: email,
    })

    const res = await this.commandBus.execute(command)
    return new AskNewEmployeeLoginTokenResponse(res)
  }
}
