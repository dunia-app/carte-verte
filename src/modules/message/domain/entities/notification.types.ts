import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { Tel } from '../../../../libs/ddd/domain/value-objects/tel.value-object'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'

export enum NotificationSendingResult {
  SUCCESS = 'SUCCESS',
  TURNED_OFF = 'TURNED_OFF',
  ERROR = 'ERROR',
}
export const notificationSendingResultEnumName =
  'notification_sending_result_enum'

export enum NotificationType {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  SMS = 'SMS',
  MAIL = 'MAIL',
}
export const notificationTypeEnumName = 'notification_type_enum'

export enum EkipNotificationErrorCodeResult {
  NOTIFICATION_TURNED_OFF = 'NOTIFICATION_TURNED_OFF',
  EMAIL_TURNED_OFF = 'EMAIL_TURNED_OFF',
}
export interface BaseNotificationOptions {
  title?: string
  content?: string
  variables?: TWithStringKeys
}

export interface NotificationInAppOption extends BaseNotificationOptions {
  title: string
  icon?: string
}

export interface NotificationPushOption extends BaseNotificationOptions {
  title: string
  deviceTokens: string[]
  icon?: string
  link?: string
}

export interface NotificationEmailOption extends BaseNotificationOptions {
  email: Email
}

export interface NotificationSmsOption extends BaseNotificationOptions {
  tel: Tel
}
