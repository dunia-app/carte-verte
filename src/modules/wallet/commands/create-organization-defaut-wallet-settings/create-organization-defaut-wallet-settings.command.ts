import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationDefautWalletSettingsAlreadyExistsError } from '../../errors/organization-defaut-wallet-settings.errors'

// Command is a plain object with properties
export class CreateOrganizationDefautWalletSettingsCommand extends Command<
  UUID,
  OrganizationDefautWalletSettingsAlreadyExistsError
> {
  constructor(
    props: CommandProps<CreateOrganizationDefautWalletSettingsCommand>,
  ) {
    super(props)
    this.organizationId = props.organizationId
  }

  readonly organizationId: UUID
}
