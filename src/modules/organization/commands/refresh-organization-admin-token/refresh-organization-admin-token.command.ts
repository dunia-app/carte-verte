import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminRefreshTokenError,
} from '../../errors/organization-admin.errors'

// Command is a plain object with properties
export class RefreshOrganizationAdminTokenCommand extends Command<
  OrganizationAdminLoginResp,
  OrganizationAdminRefreshTokenError | OrganizationAdminNotActivatedError
> {
  constructor(props: CommandProps<RefreshOrganizationAdminTokenCommand>) {
    super(props)
    this.organizationAdminId = props.organizationAdminId
    this.refreshToken = props.refreshToken
  }

  readonly organizationAdminId: string

  readonly refreshToken: string
}
