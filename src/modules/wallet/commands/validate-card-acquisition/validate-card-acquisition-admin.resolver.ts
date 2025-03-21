import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardAcquisitionNoAuthorizedOverdraftError } from '../../errors/card-acquisition.errors'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'
import { ValidateCardAcquisitionAdminRequest } from './validate-card-acquisition-admin.request.dto'
import { ValidateCardAcquisitionCommand } from './validate-card-acquisition.command'

@ObjectType()
class ValidateCardAcquisitionAdminResponse extends ErrorWithResponse(
  [
    WalletAlreadyExistsError,
    CardAcquisitionServiceError,
    CardAcquisitionNoAuthorizedOverdraftError,
  ],
  'ValidateCardAcquisitionAdminErrorUnion',
  Boolean,
) {}

@Resolver()
export class ValidateCardAcquisitionAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redis: RedisService,
  ) {}

  @AppMutation(() => ValidateCardAcquisitionAdminResponse, UserRoles.superAdmin)
  async validateCardAcquisitionAdmin(
    @Args('input') input: ValidateCardAcquisitionAdminRequest,
  ): Promise<ValidateCardAcquisitionAdminResponse> {
    const command = new ValidateCardAcquisitionCommand({
      employeeId: input.employeeId,
      externalEmployeeId: input.externalEmployeeId,
      orderId: input.orderId,
    })

    const res = await this.commandBus.execute(command)

    if (res.isOk) {
      this.redis.del(input.orderId)
      return new ValidateCardAcquisitionAdminResponse(res)
    } else {
      return new ValidateCardAcquisitionAdminResponse(res)
    }
  }
}
