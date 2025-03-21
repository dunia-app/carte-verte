import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UserOrWalletNotFoundOrNotActiveError } from '../../../../libs/ddd/domain/ports/baas.port'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardDesign } from '../../domain/entities/card.types'
import { CardAlreadyExistsError } from '../../errors/card.errors'

// Command is a plain object with properties
export class CreateVirtualCardCommand extends Command<
  UUID,
  CardAlreadyExistsError | UserOrWalletNotFoundOrNotActiveError
> {
  constructor(props: CommandProps<CreateVirtualCardCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
    this.design = props.design
  }

  readonly employeeId: string

  readonly externalEmployeeId: string

  readonly design: CardDesign
}
