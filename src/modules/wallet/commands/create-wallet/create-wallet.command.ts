import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'

// Command is a plain object with properties
export class CreateWalletCommand extends Command<
  number,
  WalletAlreadyExistsError
> {
  constructor(props: CommandProps<CreateWalletCommand>) {
    super(props)
    this.employeeIds = props.employeeIds
    this.organizationId = props.organizationId
    this.name = props.name
  }

  readonly employeeIds: string[]

  readonly organizationId: string

  readonly name: string
}
