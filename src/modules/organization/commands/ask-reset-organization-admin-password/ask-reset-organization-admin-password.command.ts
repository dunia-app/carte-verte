import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  OrganizationAdminEmailNotFound,
  OrganizationAdminNotActivatedError,
} from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class AskResetOrganizationAdminPasswordCommand extends Command<
  boolean,
  OrganizationAdminNotActivatedError | OrganizationAdminEmailNotFound
> {
  constructor(props: CommandProps<AskResetOrganizationAdminPasswordCommand>) {
    super(props)
    this.email = props.email.toLocaleLowerCase()
  }

  readonly email: string
}
