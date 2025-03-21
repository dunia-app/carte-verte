import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TreezorDeviceType } from '../../../../libs/ddd/infrastructure/baas/treezor.types'

// Command is a plain object with properties
export class UpdateCardDigitalizationCommand extends Command<UUID> {
  constructor(props: CommandProps<UpdateCardDigitalizationCommand>) {
    super(props)
    this.externalCardId = props.externalCardId
    this.cardDigitizationId = props.cardDigitizationId
    this.provider = props.provider
    this.deviceName = props.deviceName
    this.deviceType = props.deviceType
  }

  readonly externalCardId: string

  readonly cardDigitizationId: string

  readonly provider: string

  readonly deviceName?: string

  readonly deviceType?: TreezorDeviceType
}
