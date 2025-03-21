import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class AddOrganizationAdminCommand extends Command<
  string,
  OrganizationAdminAlreadyExistsError
> {
  constructor(props: CommandProps<AddOrganizationAdminCommand>) {
    super(props)
    this.email = props.email
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.organizationId = props.organizationId
    this.sendCreationEvent = props.sendCreationEvent
  }

  readonly email: string

  readonly firstname: string

  readonly lastname: string

  readonly organizationId: string

  readonly sendCreationEvent?: boolean = false
}
