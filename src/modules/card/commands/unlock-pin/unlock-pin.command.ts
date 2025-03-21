import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class UnlockPinCommand extends Command<boolean> {
  constructor(props: CommandProps<UnlockPinCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
