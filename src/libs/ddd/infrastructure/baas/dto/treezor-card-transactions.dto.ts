import { TransactionStatus } from '../../../../../modules/transaction/domain/entities/transaction.types'
import {
  TreezorCardAuthorizationProps,
  TreezorTopupCardProps,
  TreezorTransactionProps,
} from '../treezor.entity'
import { transactionStatusEnumToTreezorString } from '../treezor.types'

export interface PostSimulationCardTransactionsInputProps {
  publicToken: string
  paymentCode?: string
  paymentStatus: TransactionStatus
  date: Date
  amount: number
  mcc: string
  merchantId: string
}

export class PostSimulationCardTransactionsInput {
  constructor(props: PostSimulationCardTransactionsInputProps) {
    this.publicToken = props.publicToken
    this.paymentCode = props.paymentCode
    this.paymentStatus = transactionStatusEnumToTreezorString(
      props.paymentStatus,
    )
    this.date = props.date.toISOString()
    this.amount = props.amount.toString()
    this.mcc = props.mcc
    this.merchantId = props.merchantId
  }

  readonly publicToken: string

  readonly paymentCode?: string

  readonly paymentStatus: string

  readonly date: string

  readonly amount: string

  readonly mcc: string

  readonly merchantId: string
}

export interface TreezorTransactionsResponse {
  cardtransactions: TreezorTransactionProps[]
}

export interface TreezorTransactionsResponseWithCursor {
  cardTransactions: TreezorTransactionProps[]
  cursor: {
    prev: string
    current: string
    next: string
  }
}

export interface TreezorTopupCardResponse {
  topupCards: TreezorTopupCardProps[]
}

export interface TreezorCardAuthorizationResponse {
  authorizations: TreezorCardAuthorizationProps[]
}
