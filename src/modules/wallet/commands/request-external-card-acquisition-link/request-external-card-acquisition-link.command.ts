import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { RequestCardAcquisitionLinkResponse } from '../../dtos/card-acquisition.dto'
import { CardAcquisitionNoAuthorizedOverdraftError } from '../../errors/card-acquisition.errors'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'

// Command is a plain object with properties
export class RequestExternalCardAcquisitionLinkCommand extends Command<
  RequestCardAcquisitionLinkResponse,
  | WalletAlreadyExistsError
  | CardAcquisitionServiceError
  | CardAcquisitionNoAuthorizedOverdraftError
> {
  constructor(props: CommandProps<RequestExternalCardAcquisitionLinkCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
    this.authorizedOverdraft = props.authorizedOverdraft
  }

  readonly employeeId: string

  readonly externalEmployeeId: string

  readonly authorizedOverdraft?: number
}
