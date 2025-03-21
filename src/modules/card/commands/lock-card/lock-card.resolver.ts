import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyLockedError } from '../../errors/card.errors'
import { LockCardCommand } from './lock-card.command'

@ObjectType()
class LockCardResponse extends ErrorWithResponse(
  [CardAlreadyLockedError],
  'LockCardErrorUnion',
  LockStatus,
) {}

@Resolver()
export class LockCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => LockCardResponse, UserRoles.employee)
  async lockCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<LockCardResponse> {
    const command = new LockCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new LockCardResponse(res)
  }
}
