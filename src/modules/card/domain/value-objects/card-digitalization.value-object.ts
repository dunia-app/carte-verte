import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { TreezorDeviceType } from '../../../../libs/ddd/infrastructure/baas/treezor.types'

export enum CardDigitalizationStatus {
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
}
export interface CardDigitalizationProps {
  cardDigitalizationId?: string
  provider?: string
  deviceName?: string
  deviceType?: TreezorDeviceType
  status: CardDigitalizationStatus
}

export class CardDigitalization extends ValueObject<CardDigitalizationProps> {
  get cardDigitalizationId(): string | undefined {
    return this.props.cardDigitalizationId
  }

  get provider(): string | undefined {
    return this.props.provider
  }

  get deviceName(): string | undefined {
    return this.props.deviceName
  }

  get deviceType(): TreezorDeviceType | undefined {
    return this.props.deviceType
  }

  get status(): CardDigitalizationStatus {
    return this.props.status
  }

  protected validate(props: CardDigitalizationProps): void {}
}
