import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationAdminStatus } from '../../domain/entities/organization-admin.types'

// Query is a plain object with properties
export class OrganizationAdminStatusQuery extends Query<OrganizationAdminStatus> {
  constructor(props: QueryProps<OrganizationAdminStatusQuery>) {
    super(props)
    this.email = props.email
  }

  readonly email: string
}
