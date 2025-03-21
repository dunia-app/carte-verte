import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'

export class UpdateOrgnanizationAdminPasswordCommand extends Command<
  String,
  ExceptionBase
> {
  constructor(props: CommandProps<UpdateOrgnanizationAdminPasswordCommand>) {
    super(props)
    this.organizationAdminId = props.organizationAdminId
    this.currentPassword = props.currentPassword
    this.newPassword = props.newPassword
  }

  readonly organizationAdminId: UUID

  readonly currentPassword: string

  readonly newPassword: string
}
