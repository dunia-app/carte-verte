import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class UpdateCardLimitAdminCommand extends Command<
  number,
  ExceptionBase
> {
  constructor(props: CommandProps<UpdateCardLimitAdminCommand>) {
    super(props)
    this.limitPaymentDay = props.limitPaymentDay
    this.paymentDailyLimit = props.paymentDailyLimit
  }

  readonly limitPaymentDay: number

  readonly paymentDailyLimit: number
}
