import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'

// Query is a plain object with properties
export class FindEmployeeQuery extends Query<FindEmployeeResponseProps> {
  constructor(props: QueryProps<FindEmployeeQuery>) {
    super(props)
    this.organizationId = props.organizationId
    this.employeeId = props.employeeId
  }

  readonly organizationId: string
  readonly employeeId: string
}
