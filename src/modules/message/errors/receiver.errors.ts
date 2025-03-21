import { ExceptionBase } from '../../../libs/exceptions/index'

export class DeviceTokenAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Device token already exists for this receiver'

  public readonly code: string = 'DEVICE_TOKEN.ALREADY_EXISTS_FOR_RECEIVER'

  constructor(metadata?: unknown) {
    super(DeviceTokenAlreadyExistsError.message, metadata)
  }
}
