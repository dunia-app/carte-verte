import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardAcquisitionCreatedDomainEvent } from '../events/card-acquisition-created.domain-event'
import { CardAcquisitionToken } from '../value-objects/card-acquisition-token.value-object'
import { CardAcquisitionPayinStatus } from './card-acquisition-payin.types'

export interface CreateCardAcquisitionProps {
  externalId: string
  employeeId: string
  token: CardAcquisitionToken
  maskedPan: string
  isActive: boolean
  paymentProduct: string
  status: CardAcquisitionPayinStatus
  baasId: string
}

export interface CardAcquisitionProps extends CreateCardAcquisitionProps {}

export class CardAcquisitionEntity extends AggregateRoot<CardAcquisitionProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateCardAcquisitionProps): CardAcquisitionEntity {
    const id = UUID.generate()
    const props: CardAcquisitionProps = {
      ...create,
    }
    const cardAcquisition = new CardAcquisitionEntity({ id, props })

    cardAcquisition.addEvent(
      new CardAcquisitionCreatedDomainEvent({
        aggregateId: id.value,
        externalCardAcquisitionId: props.externalId,
        employeeId: props.employeeId,
      }),
    )
    return cardAcquisition
  }

  get token(): CardAcquisitionToken {
    return this.props.token
  }

  get externalId(): string {
    return this.props.externalId
  }

  get maskedPan(): string {
    return this.props.maskedPan
  }

  get paymentProduct(): string {
    return this.props.paymentProduct
  }

  get employeeId(): string {
    return this.props.employeeId
  }

  get baasId(): string {
    return this.props.baasId
  }

  set baasId(baasId: string) {
    this.props.baasId = baasId
  }

  cancel(): boolean {
    if (this.props.isActive === false) {
      return false
    }
    this.props.isActive = false
    return true
  }

  authorize(): boolean {
    if (this.props.status === CardAcquisitionPayinStatus.Authorized) {
      return false
    }
    this.props.status = CardAcquisitionPayinStatus.Authorized
    this.props.isActive = true
    return true
  }

  fail(): boolean {
    if (this.props.status === CardAcquisitionPayinStatus.Failed) {
      return false
    }
    this.props.status = CardAcquisitionPayinStatus.Failed
    this.props.isActive = false
    return true
  }

  public validate(): void {}
}
