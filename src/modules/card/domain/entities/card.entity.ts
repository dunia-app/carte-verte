import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TreezorDeviceType } from '../../../../libs/ddd/infrastructure/baas/treezor.types'
import { ArgumentInvalidException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  CardAlreadyActivatedError,
  CardAlreadyBlockedError,
  CardConversionAlreadyCompletedError,
  CardConversionAlreadyCoveredError,
  CardConversionAlreadyInitiatedError,
  CardConversionNotInitiatedError,
  CardNotLockedError,
  CardNotUnlockedError,
  CardPinAlreadySetError,
  CardPinNotSetError,
} from '../../errors/card.errors'
import { CardActivatedDomainEvent } from '../events/card-activated.domain-event'
import { CardCreatedDomainEvent } from '../events/card-created.domain-event'
import { CardDigitalizedDomainEvent } from '../events/card-digitalized.domain-event'
import { CardLockedDomainEvent } from '../events/card-locked.domain-event'
import { CardPinChangedDomainEvent } from '../events/card-pin-changed.domain-event'
import { CardUnlockedDomainEvent } from '../events/card-unlocked.domain-event'
import { DestroyedCardBlockedDomainEvent } from '../events/destroyed-card-blocked.domain-event'
import { LostCardBlockedDomainEvent } from '../events/lost-card-blocked.domain-event'
import { PhysicalCardRequestedDomainEvent } from '../events/physical-card-requested.domain-event'
import { StolenCardBlockedDomainEvent } from '../events/stolen-card-blocked.domain-event'
import {
  CardDigitalization,
  CardDigitalizationStatus,
} from '../value-objects/card-digitalization.value-object'
import { PinCode } from '../value-objects/pin-code.value-object'
import { CardDesign, LockStatus } from './card.types'

export interface CreateCardProps {
  employeeId: UUID
  externalId: string
  publicToken: string
  embossedName: string
  suffix: string
  design: CardDesign
}

export interface CardProps extends CreateCardProps {
  lockStatus: LockStatus
  activatedAt?: DateVO
  convertedToPhysicalAt?: DateVO
  requestedToConvertToPhysicalAt?: DateVO | null
  physicalCardPriceToCover: number
  physicalCardCoveredAt?: DateVO
  blockedAt?: DateVO
  isPinSet: boolean
  cardDigitalizations: CardDigitalization[]
  pinTryExceeded: boolean
}

export class CardEntity extends AggregateRoot<CardProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateCardProps): CardEntity {
    const id = UUID.generate()
    const props: CardProps = {
      ...create,
      lockStatus: LockStatus.UNLOCK,
      physicalCardPriceToCover: 0,
      isPinSet: false,
      cardDigitalizations: [],
      pinTryExceeded: false,
    }
    const card = new CardEntity({ id, props })

    card.addEvent(
      new CardCreatedDomainEvent({
        aggregateId: id.value,
        employeeId: props.employeeId.value,
      }),
    )
    return card
  }

  get employeeId(): UUID {
    return this.props.employeeId
  }

  get externalId(): string {
    return this.props.externalId
  }

  get publicToken(): string {
    return this.props.publicToken
  }

  get embossedName(): string {
    return this.props.embossedName
  }

  get suffix(): string {
    return this.props.suffix
  }

  get lockStatus(): LockStatus {
    return this.props.lockStatus
  }

  get isActivated(): boolean {
    return !isUndefined(this.props.activatedAt)
  }

  get isConvertedToPhysical(): boolean {
    return !isUndefined(this.props.convertedToPhysicalAt)
  }

  get physicalCardPriceToCover(): number {
    return this.props.physicalCardPriceToCover
  }

  get isBlocked(): boolean {
    return (
      this.props.lockStatus === LockStatus.DESTROYED ||
      this.props.lockStatus === LockStatus.STOLEN ||
      this.props.lockStatus === LockStatus.LOST
    )
  }

  get isUnlock(): boolean {
    return this.props.lockStatus === LockStatus.UNLOCK
  }

  get isPinSet(): boolean {
    return this.props.isPinSet
  }

  get providers(): string[] {
    return this.props.cardDigitalizations
      .map((cardDigitalization) => cardDigitalization.provider)
      .filter((item): item is string => !isUndefined(item))
  }

  get cardDigitalizationIds(): string[] {
    return this.props.cardDigitalizations
      .map((cardDigitalization) => cardDigitalization.cardDigitalizationId)
      .filter((it): it is string => !isUndefined(it))
  }

  set embossedName(embossedName: string) {
    this.props.embossedName = embossedName
  }

  set suffix(suffix: string) {
    this.props.suffix = suffix
  }

  set physicalCardPriceToCover(price: number) {
    this.props.physicalCardPriceToCover = price
  }

  set pinTryExceeded(pinTryExceeded: boolean) {
    this.props.pinTryExceeded = pinTryExceeded
  }

  get pinTryExceeded(): boolean {
    return this.props.pinTryExceeded
  }

  get design(): CardDesign {
    return this.props.design
  }

  setPin(pin: PinCode): Result<null, CardPinAlreadySetError> {
    if (this.isPinSet) {
      return Result.err(
        new CardPinAlreadySetError(
          'Pin is already set. Use changePin to update pin code',
        ),
      )
    }
    // We do not store pin code currently for security measure
    this.props.isPinSet = true
    return Result.ok(null)
  }

  changePin(pin: PinCode): Result<null, CardNotUnlockedError> {
    if (!this.isPinSet) {
      return Result.err(
        new CardPinNotSetError(
          'Pin is not set. Use setPin to set a first pin code',
        ),
      )
    }
    this.addEvent(
      new CardPinChangedDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.employeeId.value,
      }),
    )
    return Result.ok(null)
  }

  activate(): Result<null, CardNotUnlockedError | CardAlreadyActivatedError> {
    if (this.props.lockStatus !== LockStatus.UNLOCK) {
      return Result.err(new CardNotUnlockedError())
    }
    if (this.isActivated) {
      return Result.err(new CardAlreadyActivatedError())
    }
    this.props.activatedAt = DateVO.now()
    this.addEvent(
      new CardActivatedDomainEvent({
        aggregateId: this.id.value,
      }),
    )
    return Result.ok(null)
  }

  requestPhysical(
    address: Address,
  ): Result<
    boolean,
    | CardNotUnlockedError
    | CardConversionAlreadyInitiatedError
    | CardConversionAlreadyCompletedError
  > {
    if (this.props.lockStatus !== LockStatus.UNLOCK) {
      return Result.err(new CardNotUnlockedError())
    }
    if (this.props.requestedToConvertToPhysicalAt) {
      return Result.err(new CardConversionAlreadyInitiatedError())
    }
    if (this.props.convertedToPhysicalAt) {
      return Result.err(new CardConversionAlreadyCompletedError())
    }
    this.props.requestedToConvertToPhysicalAt = DateVO.now()
    return Result.ok(true)
  }

  confirmPhysical(
    address: Address,
  ): Result<
    null,
    | CardNotUnlockedError
    | CardConversionNotInitiatedError
    | CardConversionAlreadyCompletedError
  > {
    if (this.props.lockStatus !== LockStatus.UNLOCK) {
      return Result.err(new CardNotUnlockedError())
    }
    if (!this.props.requestedToConvertToPhysicalAt) {
      return Result.err(new CardConversionNotInitiatedError())
    }
    if (this.props.convertedToPhysicalAt) {
      return Result.err(new CardConversionAlreadyCompletedError())
    }
    this.props.convertedToPhysicalAt = DateVO.now()
    this.addEvent(
      new PhysicalCardRequestedDomainEvent({
        aggregateId: this.id.value,
        city: address.city,
        postalCode: address.postalCode!,
        street: address.street!,
        employeeId: this.props.employeeId,
      }),
    )
    return Result.ok(null)
  }

  expirePhysical(): Result<
    null,
    | CardNotUnlockedError
    | CardConversionNotInitiatedError
    | CardConversionAlreadyCompletedError
  > {
    if (this.props.lockStatus !== LockStatus.UNLOCK) {
      return Result.err(new CardNotUnlockedError())
    }
    if (!this.props.requestedToConvertToPhysicalAt) {
      return Result.err(new CardConversionNotInitiatedError())
    }
    if (this.props.convertedToPhysicalAt) {
      return Result.err(new CardConversionAlreadyCompletedError())
    }
    this.props.requestedToConvertToPhysicalAt = null
    return Result.ok(null)
  }

  coverPhysicalCard(): Result<null, CardConversionAlreadyCoveredError> {
    if (!this.props.convertedToPhysicalAt) {
      return Result.err(new CardConversionAlreadyCoveredError())
    }
    this.props.physicalCardCoveredAt = DateVO.now()
    return Result.ok(null)
  }

  lock(): Result<null, CardNotUnlockedError> {
    if (this.props.lockStatus !== LockStatus.UNLOCK) {
      return Result.err(new CardNotUnlockedError())
    }
    this.props.lockStatus = LockStatus.LOCK
    this.addEvent(
      new CardLockedDomainEvent({
        aggregateId: this.id.value,
      }),
    )
    return Result.ok(null)
  }

  unlock(): Result<null, CardNotLockedError> {
    if (this.props.lockStatus !== LockStatus.LOCK) {
      return Result.err(new CardNotLockedError())
    }
    this.props.lockStatus = LockStatus.UNLOCK
    this.addEvent(
      new CardUnlockedDomainEvent({
        aggregateId: this.id.value,
      }),
    )
    return Result.ok(null)
  }

  blockStolenCard(): Result<null, CardAlreadyBlockedError> {
    if (this.isBlocked) {
      return Result.err(new CardAlreadyBlockedError())
    }
    this.props.lockStatus = LockStatus.STOLEN
    this.props.blockedAt = DateVO.now()
    this.addEvent(
      new StolenCardBlockedDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.employeeId.value,
      }),
    )
    return Result.ok(null)
  }

  blockLostCard(): Result<null, CardAlreadyBlockedError> {
    if (this.isBlocked) {
      return Result.err(new CardAlreadyBlockedError())
    }
    this.props.lockStatus = LockStatus.LOST
    this.props.blockedAt = DateVO.now()
    this.addEvent(
      new LostCardBlockedDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.employeeId.value,
      }),
    )
    return Result.ok(null)
  }

  blockDestroyedCard(): Result<null, CardAlreadyBlockedError> {
    if (this.isBlocked) {
      return Result.err(new CardAlreadyBlockedError())
    }
    this.props.lockStatus = LockStatus.DESTROYED
    this.props.blockedAt = DateVO.now()
    this.addEvent(
      new DestroyedCardBlockedDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.employeeId.value,
      }),
    )
    return Result.ok(null)
  }

  completeCardDigitalization(
    cardDigitalizationId: string,
    provider?: string,
    deviceName?: string,
    deviceType?: TreezorDeviceType,
  ): Result<null> {
    // Replace initiated one by completed one
    this.props.cardDigitalizations.push(
      new CardDigitalization({
        cardDigitalizationId: cardDigitalizationId,
        status: CardDigitalizationStatus.COMPLETED,
        provider: provider,
        deviceName: deviceName,
        deviceType: deviceType,
      }),
    )
    this.addEvent(
      new CardDigitalizedDomainEvent({
        aggregateId: this.id.value,
        provider: provider,
        cardDigitizationId: cardDigitalizationId,
      }),
    )
    return Result.ok(null)
  }

  public validate(): void {
    if (
      (this.isBlocked && isUndefined(this.props.blockedAt)) ||
      (!this.isBlocked && !isUndefined(this.props.blockedAt))
    ) {
      throw new ArgumentInvalidException(
        'blocked card must have a blockedAt date set and vice versa',
      )
    }
  }
}
