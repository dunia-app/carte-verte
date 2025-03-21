import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class SetOrganizationAdminPasswordCommand extends Command<
  OrganizationAdminLoginResp,
  OrganizationAdminPasswordFormatNotCorrectError
> {
  constructor(props: CommandProps<SetOrganizationAdminPasswordCommand>) {
    super(props)
    this.email = props.email
    this.password = props.password
  }

  readonly email: string

  readonly password: string
}
