import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CaptureCardAcquisitionPayinAdminRequest } from './capture-card-acquisition-payin-admin.request.dto'
import { CaptureCardAcquisitionPayinCommand } from './capture-card-acquisition-payin.command'

@ObjectType()
class CaptureCardAcquisitionPayinAdminResponse extends ErrorWithResponse(
  [],
  'CaptureCardAcquisitionPayinAdminErrorUnion',
  Boolean,
) {}

@Resolver()
export class CaptureCardAcquisitionPayinAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => CaptureCardAcquisitionPayinAdminResponse,
    UserRoles.superAdmin,
  )
  async captureCardAcquisitionPayinAdmin(
    @Args('input') input: CaptureCardAcquisitionPayinAdminRequest,
  ): Promise<CaptureCardAcquisitionPayinAdminResponse> {
    const command = new CaptureCardAcquisitionPayinCommand({
      employeeId: input.employeeId,
      transactionExternalPaymentId: input.transactionExternalPaymentId,
      amount: input.amount,
    })

    const res = await this.commandBus.execute(command)

    if (res.isErr) {
      return new CaptureCardAcquisitionPayinAdminResponse(Result.ok(false))
    } else {
      return new CaptureCardAcquisitionPayinAdminResponse(Result.ok(true))
    }
  }
}
