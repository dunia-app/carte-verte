import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class MatchMerchantOrganizationCommand extends Command<Boolean> {
  constructor(props: CommandProps<MatchMerchantOrganizationCommand>) {
    super(props)
    this.merchantCity = props.merchantCity
    this.merchantName = props.merchantName
  }

  readonly merchantCity: string

  readonly merchantName: string
}
