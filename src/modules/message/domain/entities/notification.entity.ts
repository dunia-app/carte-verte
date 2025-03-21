import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ArgumentInvalidException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  NotificationAlreadyReceivedError,
  NotificationAlreadySentError,
  NotificationIsNotInAppTypeError,
} from '../../errors/notification.errors'
import {
  NotificationResponseProps,
  NotificationResponseVO,
} from '../value-objects/notification-response.value-object'
import { NotificationType } from './notification.types'

export interface CreateNotificationProps {
  messageId: UUID
  type: NotificationType
  willSendAt: DateVO
}

export interface NotificationProps extends CreateNotificationProps {
  title?: string
  content?: string
  sentAt?: DateVO
  failedToSendAt?: DateVO
  receivedAt?: DateVO
  response?: NotificationResponseVO
}

export class NotificationEntity extends AggregateRoot<NotificationProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateNotificationProps): NotificationEntity {
    const id = UUID.generate()
    const props: NotificationProps = {
      ...create,
    }
    const notification = new NotificationEntity({ id, props })
    return notification
  }

  get messageId(): UUID {
    return this.props.messageId
  }

  get type(): NotificationType {
    return this.props.type
  }

  get isSent(): boolean {
    return !isUndefined(this.props.sentAt)
  }

  get hasFailedToSend(): boolean {
    return !isUndefined(this.props.failedToSendAt)
  }

  get hasBeenReceived(): boolean {
    return !isUndefined(this.props.receivedAt)
  }

  get response(): NotificationResponseVO | undefined {
    return this.props.response
  }

  setResponse(response: NotificationResponseProps) {
    this.props.response = new NotificationResponseVO(response)
  }

  setSentAt(): Result<null, NotificationAlreadySentError> {
    if (!isUndefined(this.props.sentAt)) {
      return Result.err(new NotificationAlreadySentError())
    }
    if (!isUndefined(this.props.failedToSendAt)) {
      return Result.err(new NotificationAlreadySentError())
    }
    this.props.sentAt = DateVO.now()
    return Result.ok(null)
  }

  setFailedToSendAt(): Result<null, NotificationAlreadySentError> {
    if (!isUndefined(this.props.sentAt)) {
      return Result.err(new NotificationAlreadySentError())
    }
    if (!isUndefined(this.props.failedToSendAt)) {
      return Result.err(new NotificationAlreadySentError())
    }
    this.props.failedToSendAt = DateVO.now()
    return Result.ok(null)
  }

  receivedInApp(): Result<
    null,
    NotificationAlreadyReceivedError | NotificationIsNotInAppTypeError
  > {
    if (!isUndefined(this.props.receivedAt)) {
      return Result.err(new NotificationAlreadyReceivedError())
    }
    if (this.props.type !== NotificationType.IN_APP) {
      return Result.err(new NotificationIsNotInAppTypeError())
    }
    this.props.receivedAt = DateVO.now()
    return Result.ok(null)
  }

  public validate(): void {
    if (
      !isUndefined(this.props.sentAt) &&
      !isUndefined(this.props.failedToSendAt)
    ) {
      throw new ArgumentInvalidException(
        'sentAt and failedToSendAt cannot be both set ',
      )
    }
  }
}
