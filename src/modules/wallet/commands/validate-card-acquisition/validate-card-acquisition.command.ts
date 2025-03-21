import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'

// Command is a plain object with properties
export class ValidateCardAcquisitionCommand extends Command<
  boolean,
  CardAcquisitionServiceError
> {
  constructor(props: CommandProps<ValidateCardAcquisitionCommand>) {
    super(props)
    this.orderId = props.orderId
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
  }

  readonly orderId: string

  readonly employeeId: string

  readonly externalEmployeeId: string
}
