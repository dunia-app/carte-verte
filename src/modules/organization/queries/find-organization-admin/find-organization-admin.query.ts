import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'

export class FindOrganizationAdminQuery extends Query<FindOrganizationAdminResponseProps> {
  constructor(props: QueryProps<FindOrganizationAdminQuery>) {
    super(props)
    this.organizationId = props.organizationId
    this.organizationAdminId = props.organizationAdminId
  }

  readonly organizationId: string
  readonly organizationAdminId: string
}
