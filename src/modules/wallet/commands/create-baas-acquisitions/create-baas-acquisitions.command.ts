import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CardAcquisitionEntity } from '../../domain/entities/card-acquisition.entity'

export class CreateBaasAcquisitionsCommand extends Command<
  boolean,
  ExceptionBase
> {
  constructor(props: CommandProps<CreateBaasAcquisitionsCommand>) {
    super(props)
    this.cardAcquisition = props.cardAcquisition
  }

  readonly cardAcquisition: CardAcquisitionEntity
}
