import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyUnlockedError } from '../../errors/card.errors'
import { UnlockCardCommand } from './unlock-card.command'

@ObjectType()
class UnlockCardResponse extends ErrorWithResponse(
  [CardAlreadyUnlockedError],
  'UnlockCardErrorUnion',
  LockStatus,
) {}

@Resolver()
export class UnlockCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UnlockCardResponse, UserRoles.employee)
  async unlockCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<UnlockCardResponse> {
    const command = new UnlockCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new UnlockCardResponse(res)
  }
}
