import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationInfoResponse } from '../../dtos/organization.response.dto'

// Query is a plain object with properties
export class OrganizationInfoQuery extends Query<OrganizationInfoResponse> {
  constructor(props: QueryProps<OrganizationInfoQuery>) {
    super(props)
    this.organizationId = props.organizationId
  }

  readonly organizationId: string
}
