import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { NotificationSendingResult } from '../entities/notification.types'

export interface NotificationResponseProps {
  result: NotificationSendingResult
  resultObject?: any
  errorCode?: string
}

export class NotificationResponseVO extends ValueObject<NotificationResponseProps> {
  get result(): NotificationSendingResult {
    return this.props.result
  }

  get resultObject(): any | undefined {
    return this.props.resultObject
  }

  get errorCode(): string | undefined {
    return this.props.errorCode
  }

  set resultObject(resultObject) {
    this.props.resultObject = resultObject
  }

  protected validate(props: NotificationResponseProps): void {}
}
