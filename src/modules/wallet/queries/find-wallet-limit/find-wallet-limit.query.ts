import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { WalletEntity } from '../../domain/entities/wallet.entity'
import { Limit } from '../../domain/value-objects/limit.value-object'

// Query is a plain object with properties
export class FindWalletLimitQuery extends Query<
  Map<AdvantageType, Limit>,
  ExceptionBase
> {
  constructor(props: QueryProps<FindWalletLimitQuery>) {
    super(props)
    this.wallets = props.wallets
    this.employee = props.employee
  }

  readonly wallets: WalletEntity[]

  readonly employee: EmployeeEntity
}
