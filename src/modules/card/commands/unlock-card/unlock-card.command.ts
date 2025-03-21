import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { LockStatus } from '../../domain/entities/card.types'
import { CardAlreadyUnlockedError } from '../../errors/card.errors'

// Command is a plain object with properties
export class UnlockCardCommand extends Command<
  LockStatus,
  CardAlreadyUnlockedError
> {
  constructor(props: CommandProps<UnlockCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
