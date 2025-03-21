import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAlreadyAcceptedOfferError } from '../../errors/organization.errors'

// Command is a plain object with properties
export class AcceptOrganizationOfferCommand extends Command<
  Boolean,
  OrganizationAlreadyAcceptedOfferError
> {
  constructor(props: CommandProps<AcceptOrganizationOfferCommand>) {
    super(props)
    this.organizationId = props.organizationId
  }

  readonly organizationId: string
}
