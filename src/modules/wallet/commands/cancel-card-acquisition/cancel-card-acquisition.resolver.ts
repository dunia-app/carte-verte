import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CancelCardAcquisitionCommand } from './cancel-card-acquisition.command'

@ObjectType()
class CancelCardAcquisitionResponse extends ErrorWithResponse(
  [],
  'CancelCardAcquisitionErrorUnion',
  Boolean,
) {}

@Resolver()
export class CancelCardAcquisitionGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => CancelCardAcquisitionResponse, UserRoles.employee)
  async cancelCardAcquisition(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<CancelCardAcquisitionResponse> {
    const command = new CancelCardAcquisitionCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
    })

    const res = await this.commandBus.execute(command)

    return new CancelCardAcquisitionResponse(res)
  }
}
