import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class RenewCardAcquisitionPayinCommand extends Command<number> {
  constructor(props: CommandProps<RenewCardAcquisitionPayinCommand>) {
    super(props)
  }
}
