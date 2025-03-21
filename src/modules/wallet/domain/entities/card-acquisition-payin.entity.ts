import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardAcquisitionPayinCapturedDomainEvent } from '../events/card-acquisition-payin-captured.domain-event'
import { CardAcquisitionPayinCreatedDomainEvent } from '../events/card-acquisition-payin-created.domain-event'
import { CardAcquisitionPayinStatus } from './card-acquisition-payin.types'

export interface CreateCardAcquisitionPayinProps {
  externalAuthorizationId?: string
  employeeId: string
  externalCardAcquisitionId?: string
  amount: number
  reference: string
  status: CardAcquisitionPayinStatus
  transactionExternalPaymentId?: string
  errorCode?: string
  errorMessage?: string
}

export interface CardAcquisitionPayinProps
  extends CreateCardAcquisitionPayinProps {
  externalPayinId?: string
  amountCaptured?: number
}

export class CardAcquisitionPayinEntity extends AggregateRoot<CardAcquisitionPayinProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateCardAcquisitionPayinProps,
  ): CardAcquisitionPayinEntity {
    const id = UUID.generate()
    const props: CardAcquisitionPayinProps = {
      ...create,
    }
    const cardAcquisitionPayin = new CardAcquisitionPayinEntity({ id, props })

    cardAcquisitionPayin.addEvent(
      new CardAcquisitionPayinCreatedDomainEvent({
        aggregateId: id.value,
        employeeId: props.employeeId,
        amount: props.amount,
      }),
    )
    return cardAcquisitionPayin
  }

  get reference(): string {
    return this.props.reference
  }

  get amount(): number {
    return this.props.amount
  }

  get externalCardAcquisitionId(): string | undefined {
    return this.props.externalCardAcquisitionId
  }

  get externalAuthorizationId(): string | undefined {
    return this.props.externalAuthorizationId
  }

  get employeeId(): string {
    return this.props.employeeId
  }

  get transactionExternalPaymentId(): string | undefined {
    return this.props.transactionExternalPaymentId
  }

  get status(): CardAcquisitionPayinStatus {
    return this.props.status
  }

  linkTransaction(transactionExternalPaymentId: string) {
    this.props.transactionExternalPaymentId = transactionExternalPaymentId
  }

  authorize(): boolean {
    if (this.props.status === CardAcquisitionPayinStatus.Authorized) {
      return false
    }
    this.props.status = CardAcquisitionPayinStatus.Authorized
    return true
  }

  fail(): boolean {
    if (this.props.status === CardAcquisitionPayinStatus.Failed) {
      return false
    }
    this.props.status = CardAcquisitionPayinStatus.Failed
    return true
  }

  capture(transactionExternalPaymentId: string): boolean {
    if (this.props.status === CardAcquisitionPayinStatus.Captured) {
      return false
    }
    this.props.status = CardAcquisitionPayinStatus.Captured
    this.props.transactionExternalPaymentId = transactionExternalPaymentId
    return true
  }

  validateCapture(externalPayinId: string, amount: number): boolean {
    if (this.props.status !== CardAcquisitionPayinStatus.Captured) {
      this.props.status = CardAcquisitionPayinStatus.Captured
    }

    this.props.externalPayinId = externalPayinId
    this.props.amountCaptured = amount
    this.addEvent(
      new CardAcquisitionPayinCapturedDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.props.employeeId,
        amount: amount,
      }),
    )
    return true
  }

  public validate(): void {}
}
