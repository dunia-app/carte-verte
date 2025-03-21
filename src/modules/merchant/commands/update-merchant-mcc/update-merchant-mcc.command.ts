import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class UpdateMerchantMccCommand extends Command<number, ExceptionBase> {
  constructor(props: CommandProps<UpdateMerchantMccCommand>) {
    super(props)
  }
}
