import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import {
  EmployeeAlreadyAcceptedCguError,
  EmployeeFrozenError,
} from '../../errors/employee.errors'
import { AcceptCguCommand } from './accept-cgu.command'

@ObjectType()
class AcceptCguResponse extends ErrorWithResponse(
  [EmployeeAlreadyAcceptedCguError, EmployeeFrozenError],
  'AcceptCguErrorUnion',
  Boolean,
) {}

@Resolver()
export class AcceptCguGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AcceptCguResponse, UserRoles.employee)
  async acceptCgu(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<AcceptCguResponse> {
    const command = new AcceptCguCommand({
      employeeId: employee.id.value,
    })

    const id = await this.commandBus.execute(command)

    return new AcceptCguResponse(id)
  }
}
