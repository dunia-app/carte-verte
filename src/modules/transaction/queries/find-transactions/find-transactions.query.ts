import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { CursorPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { TransactionStatus } from '../../domain/entities/transaction.types'
import { TransactionsResponse } from '../../dtos/transaction.response.dto'

// Query is a plain object with properties
export class FindTransactionsQuery extends Query<TransactionsResponse> {
  constructor(props: QueryProps<FindTransactionsQuery>) {
    super(props)
    this.pagination = props.pagination
    this.startDate = props.startDate
    this.employeeId = props.employeeId
    this.status = props.status
  }

  readonly pagination: CursorPaginationBase

  readonly employeeId: string

  readonly startDate?: DateVO

  readonly status?: TransactionStatus
}
