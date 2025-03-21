import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import {
  CardAlreadyConvertedError,
  CardNotUnlockedError,
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'

export interface RequestPhysicalCardResponse {
  url?: string
  cardId: string
}
// Command is a plain object with properties
export class RequestPhysicalCardCommand extends Command<
  RequestPhysicalCardResponse,
  | CardPinAlreadySetError
  | CardPinFormatNotCorrectError
  | CardNotUnlockedError
  | CardAlreadyConvertedError
  | CardPinNotSetError
  | NotFoundException
> {
  constructor(props: CommandProps<RequestPhysicalCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
    this.newPin = props.newPin
    this.confirmPin = props.confirmPin
    this.city = props.city
    this.postalCode = props.postalCode
    this.street = props.street
    this.forceFreeOfCharge = props.forceFreeOfCharge
      ? props.forceFreeOfCharge
      : false
  }

  readonly employeeId: string

  readonly externalEmployeeId: string

  readonly newPin: string

  readonly confirmPin: string

  readonly city: string

  readonly postalCode: string

  readonly street: string

  readonly forceFreeOfCharge?: boolean
}
