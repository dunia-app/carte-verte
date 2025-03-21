import { removeWhitespace } from '../../../../helpers/string.helper'
import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExternalValidationResponseCode } from '../../domain/entities/external-validation.types'

// Command is a plain object with properties
export class AcceptTransactionCommand extends Command<ExternalValidationResponseCode> {
  constructor(props: CommandProps<AcceptTransactionCommand>) {
    super(props)
    this.cardPublicToken = props.cardPublicToken
    this.requestDate = props.requestDate
    this.paymentAmount = props.paymentAmount
    this.paymentDate = props.paymentDate
    this.merchantId = removeWhitespace(props.merchantId)
    this.merchantName = removeWhitespace(props.merchantName)
    this.merchantCity = removeWhitespace(props.merchantCity)
    this.merchantCountry = removeWhitespace(props.merchantCountry)
    this.mcc = props.mcc
    this.authorizationIssuerId = props.authorizationIssuerId
    this.time = props.time
  }

  readonly cardPublicToken: string

  readonly requestDate: Date

  readonly paymentAmount: number

  readonly paymentDate: Date

  readonly merchantId: string

  readonly merchantName: string

  readonly merchantCity: string

  readonly merchantCountry: string

  readonly mcc: string

  readonly authorizationIssuerId: string

  readonly time: number
}
