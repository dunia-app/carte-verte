import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NotFoundException } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class ConfirmCardPaymentCommand extends Command<
  string,
  TokenExpiredError | NotFoundException
> {
  constructor(props: CommandProps<ConfirmCardPaymentCommand>) {
    super(props)
    this.externalPaymentId = props.externalPaymentId
  }

  readonly externalPaymentId: string
}
