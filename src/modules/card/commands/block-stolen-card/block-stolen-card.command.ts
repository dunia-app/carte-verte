import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../errors/card.errors'

// Command is a plain object with properties
export class BlockStolenCardCommand extends Command<
  LockStatus,
  CardAlreadyBlockedError
> {
  constructor(props: CommandProps<BlockStolenCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
