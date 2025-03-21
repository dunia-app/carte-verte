import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { EmployeeDeviceValidationResponse } from '../../dtos/employee.response.dto'
import {
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'

// Query is a plain object with properties
export class EmployeeDeviceValidationInfoQuery extends Query<
  EmployeeDeviceValidationResponse,
  EmployeeNotActivatedError | EmployeeNotFoundError
> {
  constructor(props: QueryProps<EmployeeDeviceValidationInfoQuery>) {
    super(props)
    this.email = props.email
    this.addPhoneNumber = props.addPhoneNumber
  }

  readonly email: string

  readonly addPhoneNumber: boolean
}
