import fs = require('fs')
import Mailjet, { Client, LibraryResponse, SendEmailV3_1 } from 'node-mailjet'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { NotificationSendingResult } from '../../../../modules/message/domain/entities/notification.types'
import { NotificationResponseVO } from '../../../../modules/message/domain/value-objects/notification-response.value-object'
import { TWithStringKeys } from '../../../types/t-with-keys'
import { Logger } from '../../domain/ports/logger.port'
import {
  ContactAdminError,
  ContactListDoesNotExistError,
  ContactListNames,
  MailNotificationInfo,
  MessageEmitterPort,
  SendEmailError,
  SenderReceiverInfo,
  contactListNamesToID,
  defaultFrom,
  ekipContactNameToEmail,
} from '../../domain/ports/message-emitter.port'
import { Result } from '../../domain/utils/result.util'

type ResponseStatus = SendEmailV3_1.ResponseStatus

/**
 * @module MailjetMessageEmitter
 * This module exports the `MailjetMessageEmitter` class, which implements the `MessageEmitterPort` interface for sending emails and managing contacts via Mailjet.
 */

const ResponseStatus = {
  Success: 'success' as const,
  Error: 'error' as const,
}

/**
 * Interface representing an attachment.
 *
 * @interface Attachment
 * @property ContentType - The content type of the attachment.
 * @property Filename - The filename of the attachment.
 * @property Base64Content - The base64 content of the attachment.
 */
interface Attachment {
  ContentType: string
  Filename: string | undefined
  Base64Content: string
}

/**
 * Interface representing the data for an email.
 *
 * @interface EmailData
 * @property From - The sender information.
 * @property To - The receiver information.
 * @property Subject - The subject of the email.
 * @property TemplateID - The template ID of the email.
 * @property TextPart - The plain text content of the email.
 * @property TemplateLanguage - Whether the email is in a templated language.
 * @property Variables - The variables to be used in the email template.
 * @property Attachments - The attachments to be included in the email.
 */
interface EmailData {
  From: MailjetSenderReceiverInfo
  To: MailjetSenderReceiverInfo[]
  Subject: string | undefined
  TemplateID: number | undefined
  TextPart: string | undefined
  TemplateLanguage: boolean
  Variables: TWithStringKeys | undefined
  Attachments: Attachment[]
}

/**
 * Represents the sender and receiver information for Mailjet, including email and optionally name.
 */
export class MailjetSenderReceiverInfo {
  /**
   * Maps the properties of a `MessageEntity` to the properties of a `MessageOrmEntity`.
   *
   * @param entity - The `MessageEntity` to map.
   * @returns The properties of a `MessageOrmEntity`.
   */
  constructor(props: SenderReceiverInfo) {
    this.Email = props.email
    this.Name = props.name
  }

  /**
   * The email address of the sender or receiver.
   * @type {string}
   */
  readonly Email: string

  /**
   * The name of the sender or receiver.
   * @type {string}
   */
  readonly Name?: string
}

/**
 * Implements the MessageEmitterPort interface for sending emails and managing contacts via Mailjet.
 */
export class MailjetMessageEmitter implements MessageEmitterPort {
  private readonly mailClient: Client
  private readonly config: ConfigService
  private readonly logger: Logger

  /**
   * Initializes a new instance of the MailjetMessageEmitter class.
   * Connects to the Mailjet API using credentials from the ConfigService.
   * Throws an error if any of the required Mailjet configuration values are missing.
   */
  constructor() {
    this.config = new ConfigService()
    this.logger = logger
    const key = this.config.getStr('MAILJET_KEY')
    const secret = this.config.getStr('MAILJET_SECRET')
    const smsToken = this.config.getStr('MAILJET_SMS_TOKEN')
    if (!key || !secret || !smsToken) {
      const error = 'MAILJET KEY|SECRET|SMS_TOKEN NOT DEFINED'
      logger.error(`[${this.constructor.name}]: ${error}`)
      throw new Error(error)
    }
    this.mailClient = new Mailjet.Client({
      apiKey: key,
      apiSecret: secret,
    })
  }

  /**
   * Sends multiple emails using the provided MailNotificationInfo array.
   * Returns a Result object containing an array of NotificationResponseVO on success, or a SendEmailError on failure.
   * @param mailInfos Array of MailNotificationInfo, containing information for each email to be sent.
   * @returns A promise resolved with either a success or error result.
   */
  async sendMails(
    mailInfos: MailNotificationInfo[],
  ): Promise<Result<NotificationResponseVO[], SendEmailError>> {
    if (mailInfos.length === 0) return Result.ok([])
    try {
      const messages = mailInfos.map((mailInfo) => {
        const emailData: EmailData = {
          From: new MailjetSenderReceiverInfo(mailInfo?.from || defaultFrom),
          To: [new MailjetSenderReceiverInfo(mailInfo.to)],
          Subject: mailInfo.subject,
          TemplateID: mailInfo.templateID,
          TextPart: mailInfo.textPart,
          TemplateLanguage: true,
          Variables: mailInfo.variables,
          Attachments: [],
        }

        if (
          mailInfo.filesPaths != undefined &&
          mailInfo.filesPaths.length > 0
        ) {
          emailData.Attachments = mailInfo.filesPaths.map((path) => {
            let contentType = 'application/octet-stream' // Default MIME type
            if (path.toLowerCase().endsWith('.pdf')) {
              contentType = 'application/pdf'
            } else if (path.toLowerCase().endsWith('.zip')) {
              contentType = 'application/zip'
            }
            return {
              ContentType: contentType,
              Filename: path.split('/').pop(),
              Base64Content: fs.readFileSync(path, { encoding: 'base64' }),
            }
          })
        }

        return emailData
      })

      const res: LibraryResponse<SendEmailV3_1.Response> = await this.mailClient
        .post('send', { version: 'v3.1' })
        .request({ Messages: messages })
      return Result.ok(
        res.body.Messages.map((it) => {
          const result =
            it.Status === ResponseStatus.Success
              ? NotificationSendingResult.SUCCESS
              : NotificationSendingResult.ERROR
          return new NotificationResponseVO({
            result: result,
            resultObject: { CustomID: it.To[0].MessageID },
            errorCode: it.Status,
          })
        }),
      )
    } catch (err) {
      this.logger.error(
        `[${this.constructor.name}]: send template error`,
        err,
        'MailJet',
      )

      return Result.err(new SendEmailError(err))
    }
  }

  /**
   * Adds a contact to a specified Mailjet contact list.
   * Returns a Result object indicating success or failure.
   * @param Email The email address of the contact to add.
   * @param contactList The name of the contact list to add the contact to.
   * @param name The name of the contact (optional).
   * @returns A promise resolved with either a success or error result.
   */
  async addContact(
    Email: string,
    contactList: ContactListNames,
    name: string,
  ): Promise<Result<boolean, ContactListDoesNotExistError>> {
    const contactID = contactListNamesToID[contactList]
    if (!contactID) {
      this.logger.error(
        `[${this.constructor.name}]: contact list named ${contactList} does not exist`,
      )

      return Result.err(new ContactListDoesNotExistError(contactList))
    }
    const contact = {
      Email,
      Name: Email.replace(/@.+/, ''),
    } as TWithStringKeys
    if (name) contact.Properties = { name }
    try {
      const result = await this.mailClient
        .post('contact')
        .action('managemanycontacts')
        .request({
          ContactsLists: [{ ListID: contactID, action: 'addnoforce' }],

          Contacts: [contact],
        })

      this.logger.log(
        `[${this.constructor.name}]: add context ${Email} ${JSON.stringify(
          result.body,
        )}`,
        'mailjet:addContact',
      )

      return Result.ok(true)
    } catch (err: any) {
      this.logger.error(
        `[${this.constructor.name}]: ${err}`,
        null,
        'mailjet.addContact',
      )

      return Result.ok(false)
    }
  }

  /**
   * Contacts a specific ekip via email for dashboard access requests.
   * @param Subject The subject line of the email.
   * @param TextPart The plain text content of the email.
   * @param From The sender information, defaulting to the application's default sender.
   * @returns A promise resolved with a notification response value object or a contact admin error.
   */
  async contactDashboardAccess(
    Subject: string,
    TextPart: string,
    From = defaultFrom,
  ): Promise<Result<NotificationResponseVO, ContactAdminError>> {
    return this.contactEkip(
      ekipContactNameToEmail['dashboardAccess'],
      Subject,
      TextPart,
      From,
    )
  }

  /**
   * Contacts a specific partner via email.
   * @param Subject The subject line of the email.
   * @param TextPart The plain text content of the email.
   * @param From The sender information, defaulting to the application's default sender.
   * @returns A promise resolved with a notification response value object or a contact admin error.
   */
  async contactPartenaire(
    Subject: string,
    TextPart: string,
    From = defaultFrom,
  ): Promise<Result<NotificationResponseVO, ContactAdminError>> {
    return this.contactEkip(
      ekipContactNameToEmail['partenaire'],
      Subject,
      TextPart,
      From,
    )
  }

  /**
   * Sends an error log via email to a designated error log contact.
   * @param message The error message.
   * @param trace The stack trace of the error.
   * @param context Additional context about where the error occurred.
   * @param From The sender information, defaulting to the application's default sender.
   * @returns A promise resolved with a notification response value object or a contact admin error.
   */
  async sendErrorLog(
    message: string,
    trace: string,
    context: string,
    From = defaultFrom,
  ): Promise<Result<NotificationResponseVO, ContactAdminError>> {
    const formattedSubject = `Error in carte verte : ${context}`
    const formattedText = `message: ${message}\n trace: ${trace}\n context: ${context}`
    return this.contactEkip(
      ekipContactNameToEmail['errorLog'],
      formattedSubject,
      formattedText,
      From,
    )
  }

  /**
   * Generic method to contact a specific ekip via email, used internally by other methods.
   * @param To The email address to send the email to.
   * @param Subject The subject line of the email.
   * @param TextPart The plain text content of the email.
   * @param From The sender information, defaulting to the application's default sender.
   * @returns A promise resolved with a notification response value object or a contact admin error.
   */
  async contactEkip(
    To: string,
    Subject: string,
    TextPart: string,
    From = defaultFrom,
  ): Promise<Result<NotificationResponseVO, ContactAdminError>> {
    const mailjetFrom = new MailjetSenderReceiverInfo(From)
    try {
      const res: LibraryResponse<SendEmailV3_1.Response> = await this.mailClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: mailjetFrom,
              To: [
                {
                  Email: To,
                  Name: 'Ekip',
                },
              ],
              Subject,
              TextPart,
            },
          ],
        })
      const currentMessage = res.body.Messages[0]
      return Result.ok(
        new NotificationResponseVO({
          result:
            currentMessage.Status === ResponseStatus.Success
              ? NotificationSendingResult.SUCCESS
              : NotificationSendingResult.ERROR,
          resultObject: { CustomID: currentMessage.CustomID },
          errorCode: currentMessage.Status,
        }),
      )
    } catch (err: any) {
      this.logger.error(
        `[${this.constructor.name}]: contact admin error`,
        err,
        'MailJet',
      )
      return Result.err(new ContactAdminError(err))
    }
  }
}
