import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'
import { BlockStolenCardCommand } from './block-stolen-card.command'

@ObjectType()
class BlockStolenCardResponse extends ErrorWithResponse(
  [CardAlreadyBlockedError],
  'BlockStolenCardErrorUnion',
  LockStatus,
) {}

@Resolver()
export class BlockStolenCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => BlockStolenCardResponse, UserRoles.employee)
  async blockStolenCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<BlockStolenCardResponse> {
    const command = new BlockStolenCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)
    return new BlockStolenCardResponse(res)
  }
}
