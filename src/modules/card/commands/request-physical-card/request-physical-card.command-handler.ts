import { CommandHandler } from '@nestjs/cqrs'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { PaymentService } from '../../../../infrastructure/payment-service/payment-service'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { BaasAddress } from '../../../../libs/ddd/domain/ports/baas.port'
import { ProductName } from '../../../../libs/ddd/domain/ports/payment-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { OrganizationRepositoryPort } from '../../../organization/database/organization/organization.repository.port'
import { CardPaymentRepositoryPort } from '../../database/card-payment/card-payment.repository.port'
import { CardRepositoryPort } from '../../database/card/card.repository.port'
import { CardPaymentEntity } from '../../domain/entities/card-payment.entity'
import {
  CardAlreadyConvertedError,
  CardNotUnlockedError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import {
  RequestPhysicalCardCommand,
  RequestPhysicalCardResponse,
} from './request-physical-card.command'

@CommandHandler(RequestPhysicalCardCommand)
export class RequestPhysicalCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly redis: RedisService,
    protected readonly paymentService: PaymentService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: RequestPhysicalCardCommand,
  ): Promise<
    Result<
      RequestPhysicalCardResponse,
      | CardNotUnlockedError
      | CardAlreadyConvertedError
      | CardPinNotSetError
      | NotFoundException
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const cardRepo: CardRepositoryPort = this.unitOfWork.getCardRepository(
      command.correlationId,
    )
    const cardPaymentRepo: CardPaymentRepositoryPort =
      this.unitOfWork.getCardPaymentRepository(command.correlationId)
    const organizationRepo: OrganizationRepositoryPort =
      this.unitOfWork.getOrganizationRepository(command.correlationId)

    const [card, organization, physicalCardsCount] = await Promise.all([
      cardRepo.findCurrentOneByEmployeeIdOrThrow(command.employeeId),
      organizationRepo.findOneByEmployeeIdOrThrow(command.employeeId),
      cardRepo.countPhysicalCardByEmployeeId(command.employeeId),
    ])

    if (card.isConvertedToPhysical) {
      return Result.err(new CardAlreadyConvertedError())
    }

    // If command.street is too long we split it at the last whole word before 50 characters
    // and use the rest as street2
    let street1: string
    let street2: string
    let street3: string | undefined
    if (command.street.length > 50) {
      const lastSpaceIndex = command.street.lastIndexOf(' ', 50)
      const splitIndex = lastSpaceIndex === -1 ? 50 : lastSpaceIndex
      street1 = command.street.substring(0, splitIndex)
      street2 = command.street.substring(splitIndex).trim()
      street3 = organization.name
    } else {
      street1 = command.street
      street2 = organization.name
    }
    const baasAddress: BaasAddress = {
      city: command.city,
      postalCode: command.postalCode,
      street: street1,
      street2: street2,
      street3: street3,
    }
    const physicalCardInfo = {
      ...baasAddress,
      newPin: command.newPin,
      confirmPin: command.confirmPin,
    }
    // In case we already requested a payment link
    const paymentUrl = await this.redis.persist.get(
      `physicalCardRequestPayment:${card.id.value}`,
    )
    if (paymentUrl && !command.forceFreeOfCharge) {
      // Do not forget to update address info
      await this.redis.persist.set(
        `initiateCardConversion:${card.id.value}`,
        JSON.stringify(physicalCardInfo),
        'EX',
        getCacheTime(CacheTimes.OneDay),
      )
      return Result.ok({
        cardId: card.id.value,
        url: JSON.parse(paymentUrl),
      })
    }

    const entityRes = card.requestPhysical(new Address({ ...baasAddress }))
    if (entityRes.isErr) {
      return Result.err(entityRes.error)
    }
    await this.redis.persist.set(
      `initiateCardConversion:${card.id.value}`,
      JSON.stringify(physicalCardInfo),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    if (!command.forceFreeOfCharge) {
      card.physicalCardPriceToCover =
        organization.getPhysicalCardPriceForOrganization(physicalCardsCount)
    }

    const physicalCardPriceForEmployee =
      organization.getPhysicalCardPriceForEmployee(physicalCardsCount)

    if (physicalCardPriceForEmployee <= 0 || command.forceFreeOfCharge) {
      await cardRepo.save(card)
      // If no url that means card has been payed entirely by company
      return Result.ok({
        cardId: card.id.value,
      })
    }

    const checkout = await this.paymentService.getPayment(
      ProductName.PHYSICAL_CARD,
      physicalCardPriceForEmployee,
    )
    if (checkout.isErr) {
      return Result.err(checkout.error)
    }

    const cardPayment = CardPaymentEntity.create({
      cardId: card.id,
      externalPaymentId: checkout.value.id,
      price: physicalCardPriceForEmployee,
    })

    await cardPaymentRepo.save(cardPayment)

    await this.redis.persist.set(
      `physicalCardRequestPayment:${card.id.value}`,
      JSON.stringify(checkout.value.url),
      'EX',
      getCacheTime(CacheTimes.OneDay),
    )

    await cardRepo.save(card)
    return Result.ok({
      cardId: card.id.value,
      url: checkout.value.url,
    })
  }
}
