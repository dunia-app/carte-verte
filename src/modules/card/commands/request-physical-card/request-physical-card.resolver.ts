import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { RequestPhysicalCardResponse } from '../../dtos/card.response.dto'
import {
  CardAlreadyConvertedError,
  CardNotUnlockedError,
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { ConvertToPhysicalCardCommand } from '../convert-to-physical-card/convert-to-physical-card.command'
import { RequestPhysicalCardCommand } from './request-physical-card.command'
import { RequestPhysicalCardRequest } from './request-physical-card.request.dto'

@ObjectType()
class RequestPhysicalCardResponseError extends ErrorWithResponse(
  [
    CardPinAlreadySetError,
    CardPinFormatNotCorrectError,
    CardNotUnlockedError,
    CardAlreadyConvertedError,
    CardPinNotSetError,
    NotFoundException,
  ],
  'RequestPhysicalCardErrorUnion',
  RequestPhysicalCardResponse,
) {}

// TO DO: add formArgs and validator
@Resolver()
export class RequestPhysicalCardGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => RequestPhysicalCardResponseError, UserRoles.employee, {
    description:
      'Request a physical card, response is a payment url for the price of the card.',
  })
  async requestPhysicalCard(
    @Args('input') input: RequestPhysicalCardRequest,
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<RequestPhysicalCardResponseError> {
    const command = new RequestPhysicalCardCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      newPin: input.newPin,
      confirmPin: input.confirmPin,
      city: input.city,
      postalCode: input.postalCode,
      street: input.additionnalAddress
        ? `${input.additionnalAddress}, ${input.street}`
        : input.street,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new RequestPhysicalCardResponseError(Result.err(res.error))
    }
    // If no url that means card has been payed entirely by company
    // So we proceed directly to card conversion
    if (res.isOk && !res.value.url) {
      const convertCommand = new ConvertToPhysicalCardCommand({
        cardId: res.value.cardId,
      })
      const convertRes = await this.commandBus.execute(convertCommand)
      if (convertRes.isErr) {
        return new RequestPhysicalCardResponseError(
          Result.err(convertRes.error),
        )
      }
      return new RequestPhysicalCardResponseError(
        Result.ok({
          needPayment: false,
        }),
      )
    }
    return new RequestPhysicalCardResponseError(
      Result.ok({
        needPayment: true,
        url: res.isOk && res.value.url ? res.value.url : undefined,
      }),
    )
  }
}
