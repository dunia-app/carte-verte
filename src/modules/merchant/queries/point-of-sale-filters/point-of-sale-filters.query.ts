import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { AdvantageType } from '../../domain/entities/advantage.types'
import { PointOfSaleFilterResponse } from '../../dtos/merchant-filter.response.dto'

// Query is a plain object with properties
export class PointOfSaleFiltersQuery extends Query<
  PointOfSaleFilterResponse[],
  ExceptionBase
> {
  constructor(props: QueryProps<PointOfSaleFiltersQuery>) {
    super(props)
    this.employeeId = props.employeeId
    this.advantage = props.advantage
  }

  readonly employeeId: string

  readonly advantage?: AdvantageType
}
