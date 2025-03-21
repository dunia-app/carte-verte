import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'

// Query is a plain object with properties
export class CashbackSumQuery extends Query<number> {
  constructor(props: QueryProps<CashbackSumQuery>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
