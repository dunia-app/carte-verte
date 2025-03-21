import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CardAcquisitionResponse } from '../../dtos/card-acquisition.dto'

// Query is a plain object with properties
export class FindCardAcquisitionQuery extends Query<
  CardAcquisitionResponse,
  NotFoundException
> {
  constructor(props: QueryProps<FindCardAcquisitionQuery>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
