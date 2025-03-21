import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutationDev } from '../../../../libs/decorators/graphql.decorator'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CreditWalletDevCommand } from './credit-wallet-dev.command'
import { CreditWalletDevRequest } from './credit-wallet-dev.request.dto'

@ObjectType()
class CreditWalletDevResponse extends ErrorWithResponse(
  [],
  'CreditWalletDevErrorUnion',
  Number,
) {}

@Resolver()
export class CreditWalletDevGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly receiverRepo: ReceiverRepository,
    private readonly employeeRepo: EmployeeRepository,
  ) {}

  @AppMutationDev(() => CreditWalletDevResponse, UserRoles.superAdmin)
  async creditWalletDev(
    @Args('input') input: CreditWalletDevRequest,
  ): Promise<CreditWalletDevResponse> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(
      input.employeeEmail,
    )
    const employee = await this.employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )
    const command = new CreditWalletDevCommand({
      employeeId: employee.id.value,
      amount: input.amount,
    })

    const res = await this.commandBus.execute(command)

    return new CreditWalletDevResponse(res)
  }
}
