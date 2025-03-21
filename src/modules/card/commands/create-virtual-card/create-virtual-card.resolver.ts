import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { UserOrWalletNotFoundOrNotActiveError } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { EmployeeHasNotAcceptedCguError } from '../../../organization/errors/employee.errors'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardDesign } from '../../domain/entities/card.types'
import { CardAlreadyExistsError } from '../../errors/card.errors'
import { CreateVirtualCardCommand } from './create-virtual-card.command'

@ObjectType()
class CreateVirtualCardResponse extends ErrorWithResponse(
  [
    CardAlreadyExistsError,
    UserOrWalletNotFoundOrNotActiveError,
    EmployeeHasNotAcceptedCguError,
  ],
  'CreateVirtualCardErrorUnion',
  String,
) {}

@Resolver()
export class CreateVirtualCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => CreateVirtualCardResponse, UserRoles.employee)
  async createVirtualCard(
    @CurrentUser() employee: EmployeeEntity,
    @Args('design', { nullable: true, defaultValue: CardDesign.GREEN })
    design: CardDesign,
  ): Promise<CreateVirtualCardResponse> {
    if (!employee.hasAcceptedCgu) {
      return new CreateVirtualCardResponse(
        Result.err(
          new EmployeeHasNotAcceptedCguError(
            'You need to accept CGU to create a card',
          ),
        ),
      )
    }
    const command = new CreateVirtualCardCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      design: design,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new CreateVirtualCardResponse(Result.err(res.error))
    }
    return new CreateVirtualCardResponse(Result.ok(res.value.value))
  }
}
