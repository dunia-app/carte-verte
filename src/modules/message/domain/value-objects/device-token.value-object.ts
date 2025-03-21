import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'

export interface DeviceTokenProps {
  deviceTokens: string[]
  deviceId: string
}

export class DeviceToken extends ValueObject<DeviceTokenProps> {
  get deviceTokens(): string[] {
    return this.props.deviceTokens
  }

  get deviceId(): string | undefined {
    return this.props.deviceId
  }

  protected validate(props: DeviceTokenProps): void {}
}
