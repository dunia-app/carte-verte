import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import { TransferDirection, TransferSource } from '../entities/transfer.types'

// DomainEvent is a plain object with properties
export class TransferCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<TransferCreatedDomainEvent>) {
    super(props)
    this.walletId = props.walletId
    this.amount = props.amount
    this.direction = props.direction
    this.source = props.source
    this.merchantName = props.merchantName
  }

  readonly walletId: string

  readonly amount: number

  readonly direction: TransferDirection

  readonly source: TransferSource

  readonly merchantName?: string
}
