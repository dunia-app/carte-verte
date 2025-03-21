import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminAlreadyActivatedError } from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class AskNewOrganizationAdminLoginTokenCommand extends Command<
  boolean,
  OrganizationAdminAlreadyActivatedError
> {
  constructor(props: CommandProps<AskNewOrganizationAdminLoginTokenCommand>) {
    super(props)
    this.email = props.email.toLocaleLowerCase()
  }

  readonly email: string
}
