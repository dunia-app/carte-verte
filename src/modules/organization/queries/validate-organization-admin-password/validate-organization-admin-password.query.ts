import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'

// Query is a plain object with properties
export class ValidateOrganizationAdminPasswordQuery extends Query<
  Boolean,
  OrganizationAdminPasswordFormatNotCorrectError
> {
  constructor(props: QueryProps<ValidateOrganizationAdminPasswordQuery>) {
    super(props)
    this.email = props.email
    this.password = props.password
  }

  readonly email: string

  readonly password: string
}
