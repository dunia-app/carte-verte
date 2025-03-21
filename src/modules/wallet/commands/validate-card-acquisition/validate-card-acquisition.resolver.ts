import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardAcquisitionNoAuthorizedOverdraftError } from '../../errors/card-acquisition.errors'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'
import { ValidateCardAcquisitionRequest } from './validate-card-acquisition.request.dto'

@ObjectType()
class ValidateCardAcquisitionResponse extends ErrorWithResponse(
  [
    WalletAlreadyExistsError,
    CardAcquisitionServiceError,
    CardAcquisitionNoAuthorizedOverdraftError,
  ],
  'ValidateCardAcquisitionErrorUnion',
  Boolean,
) {}

@Resolver()
export class ValidateCardAcquisitionGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redis: RedisService,
  ) {}

  @AppMutation(() => ValidateCardAcquisitionResponse, UserRoles.employee)
  async validateCardAcquisition(
    @Args('input') input: ValidateCardAcquisitionRequest,
  ): Promise<ValidateCardAcquisitionResponse> {
    // const cardAcquisitionConfig = await this.redis.get(input.orderId)

    // const command = new ValidateCardAcquisitionCommand({
    //   employeeId: cardAcquisitionConfig.employeeId,
    //   externalEmployeeId: cardAcquisitionConfig.externalEmployeeId,
    //   orderId: input.orderId,
    //   authorizedOverdraft: cardAcquisitionConfig.authorizedOverdraft,
    //   paymentProduct: cardAcquisitionConfig.paymentProduct,
    // })

    // const res = await this.commandBus.execute(command)

    // if (res.isOk) {
    //   this.redis.del(input.orderId)
    //   return new ValidateCardAcquisitionResponse(res)
    // } else {
    return new ValidateCardAcquisitionResponse(Result.ok(true))
    // }
  }
}
