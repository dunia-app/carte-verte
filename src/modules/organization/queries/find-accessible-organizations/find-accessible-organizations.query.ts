import { Query } from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationEntity } from '../../domain/entities/organization.entity'

export class FindAccessibleOrganizationsQuery extends Query<
  OrganizationEntity[]
> {
  constructor(props: { organizationAdminId: string }) {
    super(props)
    this.organizationAdminId = props.organizationAdminId
  }

  readonly organizationAdminId: string
}
