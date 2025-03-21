import { ParseUUIDPipe } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { RemoveEmployeeCommand } from './remove-employee.command'

@ObjectType()
class RemoveEmployeeResponse extends ErrorWithResponse(
  [],
  'RemoveEmployeeErrorUnion',
  String,
) {}

@Resolver()
export class RemoveEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => RemoveEmployeeResponse, UserRoles.organizationAdmin)
  async removeEmployee(
    @CurrentOrganizationId() organizationId: string,
    @Args('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<RemoveEmployeeResponse> {
    const command = new RemoveEmployeeCommand({
      organizationId: organizationId,
      employeeId: employeeId,
    })

    const res = await this.commandBus.execute(command)

    return new RemoveEmployeeResponse(res)
  }
}
