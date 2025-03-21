import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminIsTheLastOneError } from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class RemoveOrganizationAdminCommand extends Command<
  string,
  OrganizationAdminIsTheLastOneError
> {
  constructor(props: CommandProps<RemoveOrganizationAdminCommand>) {
    super(props)
    this.organizationId = props.organizationId
    this.organizationAdminId = props.organizationAdminId
  }

  readonly organizationId: string

  readonly organizationAdminId: string
}
