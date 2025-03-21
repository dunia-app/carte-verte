import { Field, Float, ObjectType } from '@nestjs/graphql'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import { isUndefined } from '../../../libs/utils/is-undefined.util'
import { CardEntity } from '../domain/entities/card.entity'
import { LockStatus } from '../domain/entities/card.types'

@ObjectType()
export class CardResponse extends ResponseBase {
  constructor(
    card: CardEntity,
    maskedPan?: string,
    embossedName?: string,
    isPinLocked?: boolean,
    physicalCardPrice?: number,
  ) {
    super(card)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    const props = card.getPropsCopy()
    this.lockStatus = props.lockStatus
    this.activatedAt = props.activatedAt?.value
    this.isConvertedToPhysical = !isUndefined(
      props.convertedToPhysicalAt?.value,
    )
    this.isPinSet = card.isPinSet
    this.maskedPan = maskedPan
    this.embossedName = embossedName
    this.isPinLocked = isPinLocked
    this.physicalCardPrice = physicalCardPrice
    this.pinTryExceeded = props.pinTryExceeded
  }

  @Field(() => LockStatus)
  lockStatus: LockStatus

  @Field(() => Date, { nullable: true })
  activatedAt?: Date

  @Field(() => Boolean)
  isConvertedToPhysical: boolean

  @Field(() => Boolean)
  isPinSet: boolean

  @Field(() => String, { nullable: true })
  maskedPan?: string

  @Field(() => String, { nullable: true })
  embossedName?: string

  @Field(() => Boolean, { nullable: true })
  isPinLocked?: boolean

  @Field(() => Float, { nullable: true })
  physicalCardPrice?: number

  @Field(() => Boolean)
  pinTryExceeded: boolean
}

@ObjectType()
export class RequestPhysicalCardResponse {
  constructor(needPayment: boolean, url?: string) {
    this.needPayment = needPayment
    this.url = url
  }

  @Field(() => Boolean, {
    description:
      'Do we need a paymet for this conversion. url should be null if needPayment is false',
  })
  needPayment: boolean

  @Field(() => String, { nullable: true })
  url?: string
}
