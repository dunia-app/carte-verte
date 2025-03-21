import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import {
  CardAlreadyActivatedError,
  CardNotUnlockedError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class ActivatePhysicalCardCommand extends Command<
  boolean,
  CardNotUnlockedError | CardAlreadyActivatedError | NotFoundException
> {
  constructor(props: CommandProps<ActivatePhysicalCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
