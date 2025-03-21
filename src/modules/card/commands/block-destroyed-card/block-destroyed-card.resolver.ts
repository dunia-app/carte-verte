import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'
import { BlockDestroyedCardCommand } from './block-destroyed-card.command'

@ObjectType()
class BlockDestroyedCardResponse extends ErrorWithResponse(
  [CardAlreadyBlockedError],
  'BlockDestroyedCardErrorUnion',
  LockStatus,
) {}

@Resolver()
export class BlockDestroyedCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => BlockDestroyedCardResponse, UserRoles.employee)
  async blockDestroyedCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<BlockDestroyedCardResponse> {
    const command = new BlockDestroyedCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new BlockDestroyedCardResponse(res)
  }
}
