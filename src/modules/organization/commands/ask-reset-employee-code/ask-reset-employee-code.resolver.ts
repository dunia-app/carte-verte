import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import {
  EmployeeEmailNotFound,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'
import { AskResetEmployeeCodeCommand } from './ask-reset-employee-code.command'

@ObjectType()
class AskResetEmployeeCodeResponse extends ErrorWithResponse(
  [EmployeeNotActivatedError, EmployeeFrozenError, EmployeeEmailNotFound],
  'AskResetEmployeeCodeErrorUnion',
  Boolean,
) {}

@Resolver()
export class AskResetEmployeeCodeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskResetEmployeeCodeResponse, false)
  async askResetEmployeeCode(
    @Args('email') email: string,
  ): Promise<AskResetEmployeeCodeResponse> {
    try {
      new Email(email)
    } catch (e) {
      return new AskResetEmployeeCodeResponse(
        Result.err(new EmployeeEmailNotFound(email)),
      )
    }
    const command = new AskResetEmployeeCodeCommand({
      email: email,
    })

    const res = await this.commandBus.execute(command)

    return new AskResetEmployeeCodeResponse(res)
  }
}
