import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardDigitalizedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardDigitalizedDomainEvent>) {
    super(props)
    this.provider = props.provider
    this.cardDigitizationId = props.cardDigitizationId
  }

  readonly provider?: string

  readonly cardDigitizationId: string
}
