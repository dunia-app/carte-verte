import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { LockStatus } from '../../domain/entities/card.types'
import {
  CardAlreadyBlockedError,
  CardAlreadyLockedError,
  CardAlreadyUnlockedError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class UpdateCardLockStatusCommand extends Command<
  LockStatus,
  CardAlreadyLockedError | CardAlreadyBlockedError | CardAlreadyUnlockedError
> {
  constructor(props: CommandProps<UpdateCardLockStatusCommand>) {
    super(props)
    this.externalCardId = props.externalCardId
    this.lockStatus = props.lockStatus
  }

  readonly externalCardId: string

  readonly lockStatus: LockStatus
}
