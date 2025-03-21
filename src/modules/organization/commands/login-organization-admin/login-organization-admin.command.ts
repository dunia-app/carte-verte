import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminNotFoundError,
  WrongOrganizationAdminPasswordError,
} from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class LoginOrganizationAdminCommand extends Command<
  OrganizationAdminLoginResp,
  | OrganizationAdminNotActivatedError
  | WrongOrganizationAdminPasswordError
  | OrganizationAdminNotFoundError
> {
  constructor(props: CommandProps<LoginOrganizationAdminCommand>) {
    super(props)
    this.email = props.email
    this.password = props.password
  }

  readonly email: string

  readonly password: string
}
