import { NotificationResponseVO } from '../../../../modules/message/domain/value-objects/notification-response.value-object'
import { ExceptionBase } from '../../../exceptions/index'
import { TWithStringKeys } from '../../../types/t-with-keys'
import { Result } from '../utils/result.util'

/**
 * @module MessageEmitterPort
 * This module exports an interface `MessageEmitterPort` for sending emails and managing contacts, several types and constants related to contact lists and email contacts, and several error classes for handling errors related to sending emails and managing contacts.
 */

/**
 * Interface for sending emails and managing contacts.
 *
 * @interface MessageEmitterPort
 */
export interface MessageEmitterPort {
  /**
   * Sends multiple emails.
   *
   * @param messageInfos - Array of information for each email to be sent.
   * @returns - Promise of a result indicating whether the emails were successfully sent.
   */
  sendMails(
    messageInfos: MailNotificationInfo[],
  ): Promise<Result<NotificationResponseVO[], SendEmailError>>

  /**
   * Adds a contact to a contact list.
   *
   * @param email - The email of the contact to add.
   * @param contactList - The name of the contact list to add the contact to.
   * @param name - The name of the contact.
   * @returns - Promise of a result indicating whether the contact was successfully added.
   */
  addContact(
    email: string,
    contactList: ContactListNames,
    name: string,
  ): Promise<Result<boolean, ContactListDoesNotExistError>>

  /**
   * Contacts the dashboard access via email.
   *
   * @param subject - The subject of the email.
   * @param textPart - The text content of the email.
   * @param from - The sender information.
   * @returns - Promise of a result indicating whether the email was successfully sent.
   */
  contactDashboardAccess(
    subject: string,
    textPart: string,
    from: SenderReceiverInfo,
  ): Promise<Result<NotificationResponseVO, ContactAdminError>>
}

/**
 * Mapping of contact list names to IDs.
 * @type {Object}
 */
export const contactListNamesToID = {
  employeeActivated: 2471859,
  userNewsletter: 2491888,
}

/**
 * Type representing the names of contact lists.
 * @typedef ContactListNames
 */
export type ContactListNames = keyof typeof contactListNamesToID

/**
 * Mapping of ekip contact names to emails.
 * @type {Object}
 */
export const ekipContactNameToEmail = {
  admin: process.env.ADMIN_CONTACT_EMAIL!,
  dashboardAccess: process.env.DASHBOARD_ACCESS_CONTACT_EMAIL!,
  trustpilotTrigger: process.env.TRUSTPILOT_TRIGGER_CONTACT_EMAIL!,
  errorLog: process.env.ERROR_LOG_CONTACT_EMAIL!,
  partenaire: process.env.PARTENAIRE_CONTACT_EMAIL!,
  accounting: process.env.ACCOUNTING_CONTACT_EMAIL!,
}

/**
 * Type representing the names of ekip contacts.
 * @typedef EkipContacts
 */
export type EkipContacts = keyof typeof ekipContactNameToEmail

/**
 * Default sender information.
 * @type {SenderReceiverInfo}
 */
export const defaultFrom: SenderReceiverInfo = {
  email: 'support@carte-verte.beta.gouv.fr',
  name: 'Carte Verte',
}

/**
 * Type representing the information of a sender or receiver.
 *
 * @typedef SenderReceiverInfo
 * @property email - The email of the sender or receiver.
 * @property name - The name of the sender or receiver.
 */
export type SenderReceiverInfo = {
  email: string
  name?: string
}

/**
 * Type representing the information of a mail notification.
 *
 * @typedef MailNotificationInfo
 * @property templateID - The ID of the template of the mail notification.
 * @property textPart - The text content of the mail notification.
 * @property subject - The subject of the mail notification.
 * @property to - The receiver information.
 * @property variables - The variables to use in the mail notification.
 * @property from - The sender information.
 * @property filesPaths - The paths of the files to attach to the mail notification.
 */
export type MailNotificationInfo = {
  templateID?: number
  textPart?: string
  subject?: string
  to: SenderReceiverInfo
  variables?: TWithStringKeys
  from?: SenderReceiverInfo
  filesPaths?: string[]
}

/**
 * Error class for handling errors related to sending emails.
 */
export class SendEmailError extends ExceptionBase {
  static readonly message = 'Send email has failed'

  public readonly code: string = 'EMAIL.SEND_HAS_FAILED'

  constructor(metadata?: unknown) {
    super(SendEmailError.message, metadata)
  }
}

/**
 * Error class for handling errors related to contact lists not existing.
 */
export class ContactListDoesNotExistError extends ExceptionBase {
  static readonly message = 'The contact list provided does not exists'

  public readonly code: string = 'CONTACT_LIST.DOES_NOT_EXISTS'

  constructor(metadata?: unknown) {
    super(ContactListDoesNotExistError.message, metadata)
  }
}

/**
 * Error class for handling errors related to contacting the admin.
 */
export class ContactAdminError extends ExceptionBase {
  static readonly message = 'Contact admin has failed'

  public readonly code: string = 'EMAIL.CONTACT_ADMIN_HAS_FAILED'

  constructor(metadata?: unknown) {
    super(ContactAdminError.message, metadata)
  }
}
