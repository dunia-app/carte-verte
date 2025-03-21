import { CommandBus } from '@nestjs/cqrs'
import { Args, Int, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutationDev } from '../../../../libs/decorators/graphql.decorator'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CreateTransactionDevCommand } from './create-transaction-dev.command'
import { CreateTransactionDevRequest } from './create-transaction-dev.request.dto'

@ObjectType()
class CreateTransactionDevResponseError extends ErrorWithResponse(
  [],
  'CreateTransactionDevErrorUnion',
  Int,
) {}

@Resolver()
export class CreateTransactionDevGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly employeeRepo: EmployeeRepository,
    private readonly receiverRepo: ReceiverRepository,
  ) {}

  @AppMutationDev(() => CreateTransactionDevResponseError, UserRoles.superAdmin)
  async createTransactionDev(
    @Args('input') input: CreateTransactionDevRequest,
  ): Promise<CreateTransactionDevResponseError> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(input.email)
    const employee = await this.employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )
    const command = new CreateTransactionDevCommand({
      employeeId: employee.id.value,
      toCreate: input.numberToCreate,
      today: input.today,
      amount: input.amount,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new CreateTransactionDevResponseError(Result.err(res.error))
    }
    return new CreateTransactionDevResponseError(Result.ok(res.value))
  }
}
