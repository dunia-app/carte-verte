import { removeWhitespace } from '../../../../helpers/string.helper'
import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  PANEntryMethod,
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../domain/entities/transaction.types'
import { TransactionAlreadyExistsError } from '../../errors/transaction.errors'

// Command is a plain object with properties
export class CreateTransactionCommand extends Command<
  UUID,
  TransactionAlreadyExistsError
> {
  constructor(props: CommandProps<CreateTransactionCommand>) {
    super(props)
    this.externalCardId = props.externalCardId
    this.mid = removeWhitespace(props.mid.trim().toUpperCase())
    this.mcc = props.mcc
    this.merchantName = props.merchantName
    this.merchantCity = props.merchantCity
    this.merchantCountry = props.merchantCountry
    this.merchantAddress = props.merchantAddress
    this.externalTransactionId = props.externalTransactionId
    this.externalPaymentId = props.externalPaymentId
    this.paymentDate = props.paymentDate
    this.amount = props.amount
    this.status = props.status
    this.authorizationNote = props.authorizationNote
    this.authorizationResponseCode = props.authorizationResponseCode
    this.authorizationIssuerId = props.authorizationIssuerId
    this.authorizationMti = props.authorizationMti
    this.declinedReason = props.declinedReason
    this.panEntryMethod = props.panEntryMethod
  }

  readonly externalCardId: string

  readonly mid: string

  readonly mcc: string

  readonly merchantName: string

  readonly merchantCity: string

  readonly merchantCountry: string

  readonly merchantAddress?: string

  readonly externalTransactionId: string

  readonly externalPaymentId: string

  readonly paymentDate: Date

  readonly amount: number

  readonly status: TransactionStatus

  readonly authorizationNote: string

  readonly authorizationResponseCode: string

  readonly authorizationIssuerId: string

  readonly authorizationMti: string

  readonly declinedReason?: TransactionDeclinedReason

  readonly panEntryMethod: PANEntryMethod
}
