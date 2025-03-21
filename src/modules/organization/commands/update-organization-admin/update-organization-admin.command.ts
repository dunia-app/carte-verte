import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminNotFoundError } from '../../errors/organization-admin.errors'

export class UpdateOrganizationAdminCommand extends Command<
  string,
  OrganizationAdminNotFoundError
> {
  constructor(props: CommandProps<UpdateOrganizationAdminCommand>) {
    super(props)
    this.organizationAdminId = props.organizationAdminId
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.email = props.email
  }

  readonly organizationAdminId: string

  readonly firstname?: string

  readonly lastname?: string

  readonly email?: string
}
