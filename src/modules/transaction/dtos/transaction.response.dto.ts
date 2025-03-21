import { Field, ObjectType } from '@nestjs/graphql'
import { capitalizeEachWords } from '../../../helpers/string.helper'
import { DateVO } from '../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CursorPaginationResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import {
  TransactionDeclinedReason,
  TransactionStatus,
} from '../domain/entities/transaction.types'

export const unknownIconUrl =
  'https://storage.googleapis.com/icons_ekip/ekip_unknown.png'

export interface TransactionTranferJointProps {
  id: string
  createdAt: Date
  updatedAt: Date
  merchantName: string
  iconUrl?: string
  amount: number
  status: string
  paymentDate: Date
  declinedReason?: TransactionDeclinedReason
}
export class TransactionTransferJoint {
  constructor(props: TransactionTranferJointProps) {
    this.id = new UUID(props.id)
    this.createdAt = new DateVO(props.createdAt)
    this.updatedAt = new DateVO(props.updatedAt)
    this.merchantName = capitalizeEachWords(props.merchantName)
    this.iconUrl = props.iconUrl ? props.iconUrl : unknownIconUrl
    this.amount = props.amount
    this.status = Object.values(TransactionStatus).find(
      (trStatus) => trStatus === props.status,
    )!
    this.paymentDate = new DateVO(props.paymentDate)
    this.declinedReason = props.declinedReason
  }
  id: UUID
  createdAt: DateVO
  updatedAt: DateVO
  merchantName: string
  iconUrl: string
  amount: number
  status: TransactionStatus
  paymentDate: DateVO
  declinedReason?: TransactionDeclinedReason
}

@ObjectType()
export class TransactionResponse extends ResponseBase {
  constructor(transaction: TransactionTransferJoint) {
    super(transaction)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.merchantName = transaction.merchantName
    this.iconUrl = transaction.iconUrl
    this.amount = transaction.amount
    this.status = transaction.status
    this.paymentDate = transaction.paymentDate.value
    this.declinedReason = transaction.declinedReason
  }

  // TO DO : field to populate
  @Field(() => String)
  merchantName: string

  @Field(() => String)
  iconUrl: string

  @Field(() => Number)
  amount: number

  @Field(() => TransactionStatus)
  status: TransactionStatus

  @Field(() => Date)
  paymentDate: Date

  @Field(() => TransactionDeclinedReason, { nullable: true })
  declinedReason?: TransactionDeclinedReason
}

@ObjectType()
export class TransactionsByMonth {
  @Field(() => Date)
  month!: Date

  @Field((_Type) => [TransactionResponse], { nullable: true })
  items!: TransactionResponse[]
}

@ObjectType()
export class TransactionsResponse extends CursorPaginationResponseBase<TransactionResponse> {
  @Field((_Type) => [TransactionResponse], { nullable: true })
  data!: TransactionResponse[]

  @Field((_Type) => [TransactionsByMonth], { nullable: true })
  itemsByMonth!: TransactionsByMonth[]
}
