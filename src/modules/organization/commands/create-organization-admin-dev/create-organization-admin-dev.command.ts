import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class CreateOrganizationAdminDevCommand extends Command<
  string,
  OrganizationAdminAlreadyExistsError
> {
  constructor(props: CommandProps<CreateOrganizationAdminDevCommand>) {
    super(props)
    this.email = props.email
    this.firstname = props.firstname
    this.lastname = props.lastname
  }

  readonly email: string
  readonly firstname: string
  readonly lastname: string
}
