import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { AuthorizeCardAcquisitionPayinAdminRequest } from './authorize-card-acquisition-payin-admin.request.dto'
import { AuthorizeCardAcquisitionPayinCommand } from './authorize-card-acquisition-payin.command'

@ObjectType()
class AuthorizeCardAcquisitionPayinAdminResponse extends ErrorWithResponse(
  [],
  'AuthorizeCardAcquisitionPayinAdminErrorUnion',
  String,
) {}

@Resolver()
export class AuthorizeCardAcquisitionPayinAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => AuthorizeCardAcquisitionPayinAdminResponse,
    UserRoles.superAdmin,
  )
  async authorizeCardAcquisitionPayinAdmin(
    @Args('input') input: AuthorizeCardAcquisitionPayinAdminRequest,
  ): Promise<AuthorizeCardAcquisitionPayinAdminResponse> {
    const command = new AuthorizeCardAcquisitionPayinCommand({
      employeeId: input.employeeId,
      transactionExternalPaymentId: input.transactionExternalPaymentId,
      amount: input.amount,
    })

    const res = await this.commandBus.execute(command)

    return new AuthorizeCardAcquisitionPayinAdminResponse(res)
  }
}
