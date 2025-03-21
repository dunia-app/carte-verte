import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Throttle } from '@nestjs/throttler'
import { TokenRequestorNeedsCertificatesError } from '../../../../libs/ddd/domain/ports/baas.port'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardDigitalizationAlreadyInitiatedError,
  CardNotFoundError,
} from '../../errors/card.errors'
import { InitiateCardDigitalizationCommand } from './initiate-card-digitalization.command'
import { InitiateCardDigitalizationRequest } from './initiate-card-digitalization.request.dto'

@ObjectType()
class InitiateCardDigitalizationResponse extends ErrorWithResponse(
  [
    CardNotFoundError,
    CardDigitalizationAlreadyInitiatedError,
    TokenRequestorNeedsCertificatesError,
  ],
  'InitiateCardDigitalizationErrorUnion',
  String,
) {}

@Throttle({
  default: { limit: 1, ttl: 5000 },
})
@Resolver()
export class InitiateCardDigitalizationGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => InitiateCardDigitalizationResponse, UserRoles.employee, {
    description: 'Used to get credential to be able to add card to XPayWallet',
  })
  async initiateCardDigitalization(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: InitiateCardDigitalizationRequest,
  ): Promise<InitiateCardDigitalizationResponse> {
    const command = new InitiateCardDigitalizationCommand({
      employeeId: employee.id.value,
      xPayProvider: input.xPayProvider,
      certificates: input.certificates,
      nonce: input.nonce,
      nonceSignature: input.nonceSignature,
    })

    const res = await this.commandBus.execute(command)

    return new InitiateCardDigitalizationResponse(res)
  }
}