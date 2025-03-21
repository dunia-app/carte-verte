import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { TokenRequestorNeedsCertificatesError } from '../../../../libs/ddd/domain/ports/baas.port'
import { XPayProvider } from '../../domain/entities/card.types'
import {
  CardDigitalizationAlreadyInitiatedError,
  CardNotFoundError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class InitiateCardDigitalizationCommand extends Command<
  string,
  | CardNotFoundError
  | CardDigitalizationAlreadyInitiatedError
  | TokenRequestorNeedsCertificatesError
> {
  constructor(props: CommandProps<InitiateCardDigitalizationCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.xPayProvider = props.xPayProvider
    this.certificates = props.certificates
    this.nonce = props.nonce
    this.nonceSignature = props.nonceSignature
  }

  readonly employeeId: string

  readonly xPayProvider: XPayProvider

  readonly certificates?: string[]

  readonly nonce?: string

  readonly nonceSignature?: string
}
