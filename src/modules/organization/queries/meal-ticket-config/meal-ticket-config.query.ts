import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { OrganizationSettings } from '../../domain/value-objects/organization-settings.value-object'
import { OrganizationHasNoSettingsError } from '../../errors/organization.errors'

// Query is a plain object with properties
export class MealTicketConfigQuery extends Query<
  OrganizationSettings,
  OrganizationHasNoSettingsError
> {
  constructor(props: QueryProps<MealTicketConfigQuery>) {
    super(props)
    this.organizationId = props.organizationId
  }

  readonly organizationId: string
}
