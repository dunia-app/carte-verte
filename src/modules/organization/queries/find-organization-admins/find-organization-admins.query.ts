import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { DataWithPaginationMeta } from '../../../../libs/ddd/domain/ports/repository.ports'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'

// Query is a plain object with properties
export class FindOrganizationAdminsQuery extends Query<
  DataWithPaginationMeta<FindOrganizationAdminResponseProps[]>
> {
  constructor(props: QueryProps<FindOrganizationAdminsQuery>) {
    super(props)
    this.organizationId = props.organizationId
    this.limit = props.limit
    this.offset = props.offset
  }

  readonly organizationId: string

  readonly limit: number

  readonly offset: number
}
