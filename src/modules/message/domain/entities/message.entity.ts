import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { MessageCreatedDomainEvent } from '../events/message-created.domain-event'
import { NotificationEntity } from './notification.entity'
import { NotificationType } from './notification.types'
import { MessageTemplateName } from './template.types'

/**
 * @module MessageEntity
 * This module exports the `MessageEntity` class, which represents a message in the domain model.
 */

/**
 * Interface for the properties of a child notification.
 * 
 * @property type - The type of the notification.
 * @property willSendAt - The date when the notification will be sent.
 */
export interface ChildNotificationProp {
  type: NotificationType
  willSendAt: Date
}

/**
 * Interface for the base properties of a message.
 * 
 * @property receiverId - The ID of the receiver of the message.
 * @property templateName - The name of the message template.
 * @property variables - The variables of the message that are used to fill in the template.
 * @property skipReceiverConsent - A boolean indicating if the receiver consent is skipped.
 * @property filesPaths - An array of the paths of the files that are attached to the message.
 */
export interface BaseMessageProps {
  receiverId: UUID
  templateName: MessageTemplateName
  variables: TWithStringKeys
  skipReceiverConsent: boolean
  filesPaths ?: string[]
}

/**
 * Interface for the properties of a message when it is being created.
 * This extends `BaseMessageProps` and adds an array of `notificationsProps`.
 * 
 * @property notificationsProps - The properties of the notifications.
 */
export interface CreateMessageProps extends BaseMessageProps {
  notificationsProps: ChildNotificationProp[]
}

/**
 * Interface for the properties of a message.
 * This extends `BaseMessageProps` and adds an array of `notifications`.
 * 
 * @property notifications - The notifications of the message.
 */
export interface MessageProps extends BaseMessageProps {
  notifications?: NotificationEntity[]
}

/**
 * Class that represents a message in the domain model.
 * This class extends `AggregateRoot`, which is a base class for all aggregate roots in the domain model.
 */
export class MessageEntity extends AggregateRoot<MessageProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  /**
   * Creates a new message and its notifications.
   * 
   * @param create - The properties of the message and its notifications.
   * @returns An object that includes the new message and its notifications.
   */
  static create(create: CreateMessageProps): {
    message: MessageEntity
    notifications: NotificationEntity[]
  } {
    const id = UUID.generate()
    const props: MessageProps = {
      ...create,
      notifications: this.generateNotifications(id, create.notificationsProps),
    }
    const message = new MessageEntity({ id, props })

    message.addEvent(
      new MessageCreatedDomainEvent({
        aggregateId: id.value,
        receiverId: props.receiverId.value,
        messageTemplateName: props.templateName,
      }),
    )
    return {
      message,
      notifications: !isUndefined(props.notifications)
        ? props.notifications
        : [],
    }
  }

  /**
   * Returns the ID of receiver of the message.
   * 
   * @returns The ID of the receiver of the message.
   */
  get receiverId(): UUID {
    return this.props.receiverId
  }

  /**
   * Returns the name of the message template.
   * 
   * @returns The name of the message template.
   */
  get templateName(): MessageTemplateName {
    return this.props.templateName
  }

  /**
   * Returns the variables of the message that are used to fill in the template.
   * 
   * @returns The variables of the message.
   */
  get variables(): TWithStringKeys {
    return this.props.variables
  }

  /**
   * Return weither the receiver consent is skipped.
   * 
   * @returns A boolean indicating if the receiver consent is skipped.
   */
  get skipReceiverConsent(): boolean {
    return this.props.skipReceiverConsent
  }

  /**
   * Returns the paths of the files that are attached to the message.
   * 
   * @returns An array of the paths of the files.
   */
  get filesPaths(): string[] | undefined {
    return this.props.filesPaths
  }

  /**
   * Generates notifications for a message.
   * 
   * @param messageId - The ID of the message.
   * @param props - The properties of the notifications.
   * @returns An array of the new notifications.
   */
  static generateNotifications(
    messageId: UUID,
    props: ChildNotificationProp[],
  ): NotificationEntity[] {
    return props.map((notification) => {
      return NotificationEntity.create({
        messageId: messageId,
        type: notification.type,
        willSendAt: new DateVO(notification.willSendAt),
      })
    })
  }

  /**
   * This method 
   */
  public validate(): void {}
}
