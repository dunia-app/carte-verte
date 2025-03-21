import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { UserOrWalletNotFoundOrNotActiveError } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardAlreadyExistsError } from '../../errors/card.errors'
import { CreateVirtualCardAdminRequest } from './create-virtual-card-admin.request.dto'
import { CreateVirtualCardCommand } from './create-virtual-card.command'

@ObjectType()
class CreateVirtualCardAdminResponse extends ErrorWithResponse(
  [CardAlreadyExistsError, UserOrWalletNotFoundOrNotActiveError],
  'CreateVirtualCardAdminErrorUnion',
  String,
) {}

@Resolver()
export class CreateVirtualCardAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly employeeRepo: EmployeeRepository,
    private readonly receiverRepo: ReceiverRepository,
  ) {}

  @AppMutation(() => CreateVirtualCardAdminResponse, UserRoles.superAdmin)
  async createVirtualCardAdmin(
    @Args('input') input: CreateVirtualCardAdminRequest,
  ): Promise<CreateVirtualCardAdminResponse> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(input.email)
    const employee = await this.employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )
    if (!employee.hasAcceptedCgu) {
      employee.acceptCgu()
      await this.employeeRepo.save(employee)
    }
    const command = new CreateVirtualCardCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      design: input.design,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new CreateVirtualCardAdminResponse(Result.err(res.error))
    }
    return new CreateVirtualCardAdminResponse(Result.ok(res.value.value))
  }
}
