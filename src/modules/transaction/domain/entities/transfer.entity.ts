import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TransferCreatedDomainEvent } from '../events/transfer-created.domain-event'
import { TransferDirection, TransferSource } from './transfer.types'

export interface CommandConcerned {
  mealTicketCommandId: UUID
  amountExpired: number
}

export interface BaseTransferProps {
  walletId?: UUID
  source: TransferSource
  name: string
  paymentDate: DateVO
  amount: number
  direction: TransferDirection
}

export interface CreateTransferProps extends BaseTransferProps {
  // Mandatory for MEAL_TICKET_EXPIRATION transfer
  commandConcerned?: CommandConcerned[]
  // Mandatory for CASHBACK transfer
  merchantName?: string
}

export interface TransferProps extends BaseTransferProps {}

export class TransferEntity extends AggregateRoot<TransferProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateTransferProps): TransferEntity {
    const id = UUID.generate()
    const props: TransferProps = {
      ...create,
    }
    const transfer = new TransferEntity({ id, props })

    transfer.addEvent(
      new TransferCreatedDomainEvent({
        aggregateId: id.value,
        walletId: props.walletId!.value,
        amount: props.amount,
        direction: props.direction,
        source: props.source,
        merchantName: create.merchantName,
      }),
    )
    return transfer
  }

  get amount(): number {
    return this.props.amount
  }

  set amount(value: number) {
    this.props.amount = value
  }

  public validate(): void {}
}
