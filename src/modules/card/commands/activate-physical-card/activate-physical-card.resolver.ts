import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { logger } from '../../../../helpers/application.helper'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardAlreadyActivatedError,
  CardNotUnlockedError,
} from '../../errors/card.errors'
import { ActivatePhysicalCardCommand } from './activate-physical-card.command'

@ObjectType()
class ActivatePhysicalCardResponse extends ErrorWithResponse(
  [CardNotUnlockedError, CardAlreadyActivatedError, NotFoundException],
  'ActivatePhysicalCardErrorUnion',
  Boolean,
) {}

@Resolver()
export class ActivatePhysicalCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {
    logger.debug('Initializing ActivatePhysicalCardGraphqlResolver');
  }

  @AppMutation(() => ActivatePhysicalCardResponse, UserRoles.employee)
  async activatePhysicalCard(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<ActivatePhysicalCardResponse> {
    const command = new ActivatePhysicalCardCommand({
      employeeId: employee.id.value,
    })

    const res = await this.commandBus.execute(command)

    return new ActivatePhysicalCardResponse(res)
  }
}
