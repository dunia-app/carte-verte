import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class MerchantMerchantOrganizationCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(
    props: DomainEventProps<MerchantMerchantOrganizationCreatedDomainEvent>,
  ) {
    super(props)
    this.mid = props.mid
  }

  readonly mid: string
}
