// Importing necessary modules and classes
import _ from 'lodash'
import { replaceVariablesByValue } from '../../../../helpers/string.helper'
import { MessageEntity } from '../../../../modules/message/domain/entities/message.entity'
import { NotificationEntity } from '../../../../modules/message/domain/entities/notification.entity'
import { BaseNotificationOptions } from '../../../../modules/message/domain/entities/notification.types'
import { ReceiverEntity } from '../../../../modules/message/domain/entities/receiver.entity'
import { TemplateEntity } from '../../../../modules/message/domain/entities/template.entity'
import { NotificationResponseVO } from '../../../../modules/message/domain/value-objects/notification-response.value-object'
import { TWithStringKeys } from '../../../types/t-with-keys'

/**
 * @module NotificationTransportHandler
 * This module exports several types and an abstract class `NotificationTransportHandler` for handling notifications.
 */

/**
 * Type representing the payload of a notification
 * 
 * @typeparam T - Type of the payload
 * @typeparam P - Type of the transport options extends {@link BaseNotificationOptions}
 * 
 * @property id - Id of the notification, must fit the UUID format
 * @property transportsOptions - Optional transport options
 * @property payload - Payload of the notification
 * 
 * @example
 * 
 * ```typescript
 * const payload: NotificationPayload<string, NotificationEmailOption> = {
 *  id: '123e4567-e89b-12d3-a456-426614174000',
 *  transportsOptions: {
 *    email: new Email('test@gmail.com')
 *  },
 *  payload: 'Hello World'
 * }
 */
export type NotificationPayload<T, P extends BaseNotificationOptions> = {
  id: string
  transportsOptions?: P
  payload: T
}

/**
 * Type representing the response of a notification
 * 
 * @property id - Id of the notification
 * @property {@link NotificationResponseVO} response - Notification response value object
 * 
 * @example
 * 
 * ```typescript
 * const response: NotificationResponse = {
 *  id: '123e4567-e89b-12d3-a456-426614174000',
 *  response: new NotificationResponseVO({
 *    result: NotificationSendingResult.SUCCESS
 * })
 */
export type NotificationResponse = {
  id: string
  response: NotificationResponseVO
}

/**
 * Type representing the options of a notification
 * 
 * Either {@link NotificationEntity} or {@link MessageEntity}
 */
export type notifOption = NotificationEntity & MessageEntity

/**
 * Type representing the info of a message receiver
 * 
 * Alias for a {@link Pick} of {@link ReceiverEntity} with only `deviceTokens` and `email` properties
 */
export type MessageReceiverInfo = Pick<ReceiverEntity, 'deviceTokens' | 'email'>

/**
 * Abstract class representing a notification transport handler
 * 
 * @typeparam T - Type of the variables
 * @typeparam K - Type of the notification options extends {@link BaseNotificationOptions}
 * @typeparam P - Type of the payload extends {@link NotificationPayload}
 * 
 */
export abstract class NotificationTransportHandler<
  T,
  K extends BaseNotificationOptions,
  P = NotificationPayload<T, K>,
> {
  /**
   * Abstract method to send messages
   * @param messages - Array of messages to send
   * @returns - Promise of array of NotificationResponse objects
   */
  public abstract sendMessages(messages: P[]): Promise<NotificationResponse[]>

  /**
   * Abstract method to transform a message to a payload
   * @param notification - NotificationEntity object
   * @param message - MessageEntity object
   * @param receiver - Optional MessageReceiverInfo object
   * @param template - Optional TemplateEntity object
   * @returns - Promise of array of payloads
   */
  public abstract transformMessageToPayload(
    notification: NotificationEntity,
    message: MessageEntity,
    receiver?: MessageReceiverInfo,
    template?: TemplateEntity,
  ): Promise<P[]>

  /**
   * Replace variables in notification options with their values
   * @param notifOptions - Notification options
   * @param template - TemplateEntity object
   * @returns - Notification options with variables replaced by their values
   */
  protected replaceVariables<OPT extends BaseNotificationOptions>(
    notifOptions: OPT,
    template: TemplateEntity,
  ) : OPT {
    const notifOptionsResult = _.cloneDeep(notifOptions)
    const variables = { ...notifOptionsResult.variables }
    for (const key in variables) {
      variables[key.toLowerCase()] = variables[key]
    }
    notifOptionsResult.content = this.handleVariables(
      notifOptionsResult?.content ?? template.content,
      variables,
    )
    const title = notifOptionsResult?.title ?? template?.title
    if (title) {
      notifOptionsResult.title = this.handleVariables(title, variables)
    }
    return notifOptionsResult
  }

  /**
   * Replace variables in a string with their values
   * @param value - String with variables
   * @param variables - Object with variable names as keys and their values as values
   * @returns - String with variables replaced by their values
   */
  protected handleVariables = (value: string, variables: TWithStringKeys) => {
    return replaceVariablesByValue(value, variables)
  }
}