import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { SuperAdminLoginResp } from '../../dtos/super-admin.response.dto'
import { WrongSuperAdminPasswordError } from '../../errors/super-admin.errors'

// Command is a plain object with properties
export class LoginSuperAdminCommand extends Command<
  SuperAdminLoginResp,
  WrongSuperAdminPasswordError
> {
  constructor(props: CommandProps<LoginSuperAdminCommand>) {
    super(props)
    this.email = props.email
    this.password = props.password
  }

  readonly email: string

  readonly password: string
}
