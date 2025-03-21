import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationStatus } from '../../domain/entities/organization.types'

// Query is a plain object with properties
export class OrganizationStatusByTokenQuery extends Query<OrganizationStatus> {
  constructor(props: QueryProps<OrganizationStatusByTokenQuery>) {
    super(props)
    this.token = props.token
    this.organizationId = props.organizationId
  }

  readonly token: string

  readonly organizationId: string
}
