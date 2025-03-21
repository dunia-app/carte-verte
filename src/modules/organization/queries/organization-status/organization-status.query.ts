import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationStatus } from '../../domain/entities/organization.types'

// Query is a plain object with properties
export class OrganizationStatusQuery extends Query<OrganizationStatus> {
  constructor(props: QueryProps<OrganizationStatusQuery>) {
    super(props)
    this.organizationId = props.organizationId
  }

  readonly organizationId: string
}
