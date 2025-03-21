import { ParseUUIDPipe } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeAlreadyFrozenError } from '../../errors/employee.errors'
import { FreezeEmployeeCommand } from './freeze-employee.command'

@ObjectType()
class FreezeEmployeeResponse extends ErrorWithResponse(
  [EmployeeAlreadyFrozenError],
  'FreezeEmployeeErrorUnion',
  Boolean,
) {}

@Resolver()
export class FreezeEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => FreezeEmployeeResponse, UserRoles.superAdmin)
  async freezeEmployee(
    @Args('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<FreezeEmployeeResponse> {
    const command = new FreezeEmployeeCommand({
      employeeId: employeeId,
    })

    const res = await this.commandBus.execute(command)

    return new FreezeEmployeeResponse(res)
  }
}
