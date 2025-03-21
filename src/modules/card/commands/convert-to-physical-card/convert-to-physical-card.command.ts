import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NotFoundException } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class ConvertToPhysicalCardCommand extends Command<
  boolean,
  TokenExpiredError | NotFoundException
> {
  constructor(props: CommandProps<ConvertToPhysicalCardCommand>) {
    super(props)
    this.cardId = props.cardId
  }

  readonly cardId: string
}
