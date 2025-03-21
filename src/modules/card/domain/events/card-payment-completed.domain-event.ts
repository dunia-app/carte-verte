import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardPaymentCompletedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardPaymentCompletedDomainEvent>) {
    super(props)
    this.price = props.price
  }

  readonly price: number
}
