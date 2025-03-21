import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import { TransactionDeclinedReason } from '../../../transaction/domain/entities/transaction.types'
import { ExternalValidationResponseCode } from '../entities/external-validation.types'

// DomainEvent is a plain object with properties
export class ExternalValidationCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<ExternalValidationCreatedDomainEvent>) {
    super(props)
    this.cardId = props.cardId
    this.responseCode = props.responseCode
    this.declinedReason = props.declinedReason
    this.amount = props.amount
    this.mid = props.mid
    this.merchantName = props.merchantName
  }

  readonly cardId: string

  readonly responseCode: ExternalValidationResponseCode

  readonly declinedReason?: TransactionDeclinedReason

  readonly amount: number

  readonly mid: string

  readonly merchantName: string
}
