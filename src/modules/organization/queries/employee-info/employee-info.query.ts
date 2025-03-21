import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'

// Query is a plain object with properties
export class EmployeeInfoQuery extends Query<FindEmployeeResponseProps> {
  constructor(props: QueryProps<EmployeeInfoQuery>) {
    super(props)
    this.userId = props.userId
  }

  readonly userId: string
}
