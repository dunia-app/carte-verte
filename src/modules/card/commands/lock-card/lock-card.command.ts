import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyLockedError } from '../../errors/card.errors'

// Command is a plain object with properties
export class LockCardCommand extends Command<
  LockStatus,
  CardAlreadyLockedError
> {
  constructor(props: CommandProps<LockCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
