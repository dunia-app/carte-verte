import _ from 'lodash'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ArgumentInvalidException } from '../../../../libs/exceptions/index'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { TransactionDeclinedReason } from '../../../transaction/domain/entities/transaction.types'
import { ExternalValidationCreatedDomainEvent } from '../events/external-validation-created.domain-event'
import { ExternalValidationResponseCode } from './external-validation.types'

export interface CreateExternalValidationProps {
  cardPublicToken: string
  paymentAmount: number
  paymentDate: Date
  mcc: MCC
  mid: string
  merchantName: string
  authorizationIssuerId: string
  responseCode: ExternalValidationResponseCode
  declinedReason?: TransactionDeclinedReason
  cardId?: UUID
  siret?: string
  msToAnswer?: number
  triedMerchantMatching?: boolean
}

export interface ExternalValidationProps
  extends CreateExternalValidationProps {}

export class ExternalValidationEntity extends AggregateRoot<ExternalValidationProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateExternalValidationProps,
  ): ExternalValidationEntity {
    const id = UUID.generate()
    const props: ExternalValidationProps = {
      ...create,
    }
    const externalValidation = new ExternalValidationEntity({ id, props })

    if (props.cardId) {
      externalValidation.addEvent(
        new ExternalValidationCreatedDomainEvent({
          aggregateId: id.value,
          cardId: props.cardId.value,
          responseCode: props.responseCode,
          declinedReason: props.declinedReason,
          amount: props.paymentAmount,
          mid: props.mid,
          merchantName: props.merchantName,
        }),
      )
    }
    return externalValidation
  }

  get responseCode(): ExternalValidationResponseCode {
    return this.props.responseCode
  }

  get declinedReason(): TransactionDeclinedReason | undefined {
    return this.props.declinedReason
  }

  get siret(): string | undefined {
    return this.props.siret
  }

  get authorizationIssuerId(): string {
    return this.props.authorizationIssuerId
  }

  set cardId(cardId: UUID) {
    this.props.cardId = cardId
  }

  set msToAnswer(msToAnswer: number) {
    this.props.msToAnswer = msToAnswer
  }

  public validate(): void {
    if (
      this.props.responseCode === ExternalValidationResponseCode.AUTHORIZED &&
      !_.isUndefined(this.props.declinedReason)
    ) {
      this.props.declinedReason = undefined
    }
    if (
      this.props.responseCode !== ExternalValidationResponseCode.AUTHORIZED &&
      this.props.responseCode !==
        ExternalValidationResponseCode.DECLINED_CARD_UNKNOW &&
      _.isUndefined(this.props.declinedReason)
    ) {
      throw new ArgumentInvalidException(
        'Please provide a reason for transaction decline',
      )
    }
  }
}
