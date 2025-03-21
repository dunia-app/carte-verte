import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardAlreadyConvertedError,
  CardNotUnlockedError,
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { ConvertToPhysicalCardCommand } from '../convert-to-physical-card/convert-to-physical-card.command'
import { RequestPhysicalCardCommand } from '../request-physical-card/request-physical-card.command'
import { RequestPhysicalCardAdminRequest } from './request-physical-card-admin.request.dto'

@ObjectType()
class RequestPhysicalCardAdminResponseError extends ErrorWithResponse(
  [
    CardPinAlreadySetError,
    CardPinFormatNotCorrectError,
    CardNotUnlockedError,
    CardAlreadyConvertedError,
    CardPinNotSetError,
    NotFoundException,
  ],
  'RequestPhysicalCardAdminErrorUnion',
  Boolean,
) {}

// TO DO: add formArgs and validator
@Resolver()
export class RequestPhysicalCardAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly employeeRepo: EmployeeRepository,
    private readonly receiverRepo: ReceiverRepository,
  ) {}

  @AppMutation(
    () => RequestPhysicalCardAdminResponseError,
    UserRoles.superAdmin,
    {
      description: 'Request a physical card, automatically free of charge.',
    },
  )
  async requestPhysicalCardAdmin(
    @Args('input') input: RequestPhysicalCardAdminRequest,
  ): Promise<RequestPhysicalCardAdminResponseError> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(input.email)
    const employee = await this.employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )
    const command = new RequestPhysicalCardCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      newPin: input.newPin,
      confirmPin: input.confirmPin,
      city: input.city,
      postalCode: input.postalCode,
      street: input.street,
      // Card that are requested by admin are automatically free of charge
      forceFreeOfCharge: true,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new RequestPhysicalCardAdminResponseError(Result.err(res.error))
    }
    if (res.isErr) {
      return new RequestPhysicalCardAdminResponseError(Result.ok(false))
    }
    // Card that are requested by admin are automatically free of charge
    // So we proceed directly to card conversion
    const convertCommand = new ConvertToPhysicalCardCommand({
      cardId: res.value.cardId,
    })
    const convertRes = await this.commandBus.execute(convertCommand)
    if (convertRes.isErr) {
      return new RequestPhysicalCardAdminResponseError(
        Result.err(convertRes.error),
      )
    }
    return new RequestPhysicalCardAdminResponseError(Result.ok(true))
  }
}
