import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { UpdateCardAcquisitionOverdraftCommand } from './update-card-acquisition-overdraft.command'
import { UpdateCardAcquisitionOverdraftRequest } from './update-card-acquisition-overdraft.request-dto'

@ObjectType()
class UpdateCardAcquisitionOverdraftResponse extends ErrorWithResponse(
  [],
  'UpdateCardAcquisitionOverdraftErrorUnion',
  Number,
) {}

@Resolver()
export class UpdateCardAcquisitionOverdraftGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UpdateCardAcquisitionOverdraftResponse, UserRoles.employee)
  async updateCardAcquisitionOverdraft(
    @Args('input') input: UpdateCardAcquisitionOverdraftRequest,
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<UpdateCardAcquisitionOverdraftResponse> {
    const command = new UpdateCardAcquisitionOverdraftCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      overdraftLimit: input.authorizedOverdraft,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateCardAcquisitionOverdraftResponse(res)
  }
}
