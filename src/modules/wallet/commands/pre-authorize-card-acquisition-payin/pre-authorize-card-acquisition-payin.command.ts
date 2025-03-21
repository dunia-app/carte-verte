import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class PreAuthorizeCardAcquisitionPayinCommand extends Command<
  boolean,
  ExceptionBase
> {
  constructor(props: CommandProps<PreAuthorizeCardAcquisitionPayinCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
    this.externalCardAcquisitionId = props.externalCardAcquisitionId
    this.cardAcquisitionToken = props.cardAcquisitionToken
    this.amount = props.amount
    this.paymentProduct = props.paymentProduct
    this.baasId = props.baasId
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.email = props.email
    this.address = props.address
    this.cardHolder = props.cardHolder
  }

  readonly employeeId: string

  readonly externalEmployeeId: string

  readonly externalCardAcquisitionId: string

  readonly cardAcquisitionToken: string

  readonly amount: number

  readonly paymentProduct: string

  readonly baasId: string

  readonly firstname: string

  readonly lastname: string

  readonly email: string

  readonly address: Address

  readonly cardHolder: string
}
