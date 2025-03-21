import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  CardConversionAlreadyCompletedError,
  CardConversionNotInitiatedError,
  CardNotUnlockedError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class ExpirePhysicalCardRequestCommand extends Command<
  true,
  | CardNotUnlockedError
  | CardConversionNotInitiatedError
  | CardConversionAlreadyCompletedError
> {
  constructor(props: CommandProps<ExpirePhysicalCardRequestCommand>) {
    super(props)
    this.cardId = props.cardId
  }

  readonly cardId: string
}
