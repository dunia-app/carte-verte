import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardPaymentExpiredDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardPaymentExpiredDomainEvent>) {
    super(props)
    this.price = props.price
  }

  readonly price: number
}
