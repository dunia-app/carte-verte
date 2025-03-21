import { ParseUUIDPipe } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeAlreadyUnfrozenError } from '../../errors/employee.errors'
import { UnfreezeEmployeeCommand } from './unfreeze-employee.command'

@ObjectType()
class UnfreezeEmployeeResponse extends ErrorWithResponse(
  [EmployeeAlreadyUnfrozenError],
  'UnfreezeEmployeeErrorUnion',
  Boolean,
) {}

@Resolver()
export class UnfreezeEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UnfreezeEmployeeResponse, UserRoles.superAdmin)
  async unfreezeEmployee(
    @Args('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<UnfreezeEmployeeResponse> {
    const command = new UnfreezeEmployeeCommand({
      employeeId: employeeId,
    })

    const res = await this.commandBus.execute(command)

    return new UnfreezeEmployeeResponse(res)
  }
}
