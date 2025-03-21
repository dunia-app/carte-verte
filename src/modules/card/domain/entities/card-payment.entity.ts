import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  CardPaymentAlreadyCompletedError,
  CardPaymentAlreadyExpiredError,
} from '../../errors/card-payment.errors'
import { CardPaymentCompletedDomainEvent } from '../events/card-payment-completed.domain-event'
import { CardPaymentExpiredDomainEvent } from '../events/card-payment-expired.domain-event'
import { CardPaymentStatus } from './card-payment.types'

export interface CreateCardPaymentProps {
  cardId: UUID
  externalPaymentId: string
  price: number
}

export interface CardPaymentProps extends CreateCardPaymentProps {
  status: CardPaymentStatus
}

export class CardPaymentEntity extends AggregateRoot<CardPaymentProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateCardPaymentProps): CardPaymentEntity {
    const id = UUID.generate()
    const props: CardPaymentProps = {
      ...create,
      status: CardPaymentStatus.IN_PROGRESS,
    }
    const cardPayment = new CardPaymentEntity({ id, props })

    return cardPayment
  }

  get cardId(): string {
    return this.props.cardId.value
  }

  get externalPaymentId(): string {
    return this.props.externalPaymentId
  }

  confirmPayment(): Result<
    boolean,
    CardPaymentAlreadyCompletedError | CardPaymentAlreadyExpiredError
  > {
    if (this.props.status === CardPaymentStatus.COMPLETED) {
      return Result.err(new CardPaymentAlreadyCompletedError())
    }
    if (this.props.status === CardPaymentStatus.EXPIRED) {
      return Result.err(new CardPaymentAlreadyExpiredError())
    }
    this.props.status = CardPaymentStatus.COMPLETED
    this.addEvent(
      new CardPaymentCompletedDomainEvent({
        aggregateId: this.id.value,
        price: this.props.price,
      }),
    )
    return Result.ok(true)
  }

  expirePayment(): Result<
    boolean,
    CardPaymentAlreadyCompletedError | CardPaymentAlreadyExpiredError
  > {
    if (this.props.status === CardPaymentStatus.COMPLETED) {
      return Result.err(new CardPaymentAlreadyCompletedError())
    }
    if (this.props.status === CardPaymentStatus.EXPIRED) {
      return Result.err(new CardPaymentAlreadyExpiredError())
    }
    this.props.status = CardPaymentStatus.EXPIRED
    this.addEvent(
      new CardPaymentExpiredDomainEvent({
        aggregateId: this.id.value,
        price: this.props.price,
      }),
    )
    return Result.ok(true)
  }

  public validate(): void {}
}
