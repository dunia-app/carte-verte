import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeNotFoundError } from '../../errors/employee.errors'

// Query is a plain object with properties
export class EmployeeStatusQuery extends Query<
  EmployeeStatus,
  EmployeeNotFoundError
> {
  constructor(props: QueryProps<EmployeeStatusQuery>) {
    super(props)
    this.email = props.email
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly deviceId?: string
}
