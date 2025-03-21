import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import { EmployeeNotFoundError } from '../../errors/employee.errors'
import { UpdateEmployeeCommand } from './update-employee.command'
import { UpdateEmployeeRequest } from './update-employee.request.dto'

@ObjectType()
class UpdateEmployeeResponse extends ErrorWithResponse(
  [EmployeeNotFoundError],
  'UpdateEmployeeErrorUnion',
  String,
) {}

@Resolver()
export class UpdateEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UpdateEmployeeResponse, UserRoles.employee)
  async updateEmployee(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    const command = new UpdateEmployeeCommand({
      organizationId: employee.organizationId.value,
      employeeId: employee.id.value,
      firstname: input.firstname,
      lastname: input.lastname,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateEmployeeResponse(res)
  }
}
