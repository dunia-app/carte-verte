import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { WalletResponse } from '../../dtos/wallet.response.dto'

// Query is a plain object with properties
export class FindWalletQuery extends Query<WalletResponse> {
  constructor(props: QueryProps<FindWalletQuery>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
