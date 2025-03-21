import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'
import { BlockLostCardCommand } from './block-lost-card.command'

@ObjectType()
class BlockLostCardResponse extends ErrorWithResponse(
  [CardAlreadyBlockedError],
  'BlockLostCardErrorUnion',
  LockStatus,
) {}

@Resolver()
export class BlockLostCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => BlockLostCardResponse, UserRoles.employee)
  async blockLostCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<BlockLostCardResponse> {
    const command = new BlockLostCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new BlockLostCardResponse(res)
  }
}
