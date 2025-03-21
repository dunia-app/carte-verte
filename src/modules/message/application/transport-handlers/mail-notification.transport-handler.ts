import { Result } from '@badrap/result'
import { Injectable } from '@nestjs/common'
import { logger } from '../../../../helpers/application.helper'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { MessageEmitter } from '../../../../infrastructure/message-emitter/message-emitter'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import {
  MessageReceiverInfo,
  NotificationPayload,
  NotificationResponse,
  NotificationTransportHandler,
} from '../../../../libs/ddd/domain/base-classes/transport-handler.base'
import {
  MailNotificationInfo,
  SendEmailError,
} from '../../../../libs/ddd/domain/ports/message-emitter.port'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import { NotificationEmailOption } from '../../domain/entities/notification.types'
import { TemplateEntity } from '../../domain/entities/template.entity'
import { NotificationResponseVO } from '../../domain/value-objects/notification-response.value-object'

const cryptoRandomString = require('crypto-random-string')
import fs = require('fs')
import _ = require('lodash')
/**
 * @module MailNotificationTransportService
 * This module exports the `MailNotificationTransportService` class, which extends the `NotificationTransportHandler` abstract class for handling mail notifications.
 */

/**
 * Class for handling mail notifications.
 */
@Injectable()
export class MailNotificationTransportService extends NotificationTransportHandler<
  MailNotificationInfo,
  NotificationEmailOption
> {
  /**
   * Initializes a new instance of the `MailNotificationTransportService` class.
   *
   * @param messageEmitter - The message emitter.
   */
  constructor(
    private readonly messageEmitter: MessageEmitter,
    private readonly redis: RedisService,
  ) {
    super()
  }

  /**
   * Deletes mail attachments.
   * Use it after the mail has been sent.
   *
   * @param filesPaths - Array of files paths.
   */
  private deleteMailAttachments(filesPaths: string[]) {
    for (const filePath of filesPaths) {
      fs.unlink(filePath, (err) => {
        if (err) logger.error(`Error deleting file ${filePath}: ${err}`)
        else logger.debug(`File ${filePath} deleted successfully.`)
      })
    }
  }

  /**
   * Sends multiple mail notifications.
   *
   * @param messages - Array of messages to send.
   * @returns - Promise of array of NotificationResponse objects.
   */
  private async sendMails(
    messages: NotificationPayload<
      MailNotificationInfo,
      NotificationEmailOption
    >[],
  ): Promise<
    {
      response: Result<NotificationResponseVO[], SendEmailError>
      index: number
    }[]
  > {
    const batches = _.chunk(messages, 50)
    const promises: Promise<{
      response: Result<NotificationResponseVO[], SendEmailError>
      index: number
    }>[] = []

    for (let i = 0; i < batches.length; i++) {
      const batchMailInfo = batches[i].map((it) => it.payload)

      const promise = this.messageEmitter
        .sendMails(batchMailInfo)
        .then((res) => {
          return { response: res, index: i }
        })

      promises.push(promise)
    }

    const batchResults = await Promise.all(promises)
    this.deleteMailAttachments(
      messages.map((it) => it.payload.filesPaths ?? []).flat(),
    )

    return batchResults
  }

  /**
   * Handles the responses from sending notifications.
   * Add successful results to the successResults array and
   * files to delete (files which have been sent) to the filesToDelete array.
   *
   * @param items - Array of notification response objects.
   * @param messages - Array of messages.
   * @param successResults - Array of successful results.
   * @param filesToDelete - Array of files to delete.
   * @param it - The index of the current batch.
   */
  private handleNotificationsResponses(
    items: NotificationResponseVO[],
    messages: NotificationPayload<
      MailNotificationInfo,
      NotificationEmailOption
    >[],
    successResults: NotificationResponse[],
    it: { index: number },
  ): void {
    for (let i = 0; i < items.length; i++) {
      const respItem = items[i]
      const messageItem = messages[i + it.index]

      successResults.push({
        id: messageItem.id,
        response: respItem,
      })
    }
  }

  /**
   * Sends multiple mail notifications.
   *
   * @param messages - Array of messages to send.
   * @returns - Promise of array of NotificationResponse objects.
   */
  async sendMessages(
    messages: NotificationPayload<
      MailNotificationInfo,
      NotificationEmailOption
    >[],
  ): Promise<NotificationResponse[]> {
    const successResults: NotificationResponse[] = []

    const batchResults = await this.sendMails(messages)

    let totalMessageSent = 0
    // handle results
    for (const it of batchResults) {
      const response = it.response
      if (response.isOk) {
        const items = response.unwrap()
        totalMessageSent += items.length
        this.handleNotificationsResponses(items, messages, successResults, it)
      }
    }
    if (totalMessageSent > 0) {
      logger.log(
        `[${this.constructor.name}]: ${totalMessageSent} mail sent successfully.`,
      )
    }
    if (messages.length - totalMessageSent > 0) {
      logger.warn(
        `[${this.constructor.name}]: ${
          messages.length - totalMessageSent
        } mail failed to send.`,
      )
    }
    return successResults
  }

  /**
   * Transforms a message to a payload.
   *
   * @param notification - The notification.
   * @param message - The message.
   * @param receiver - The receiver information.
   * @param template - The template.
   * @returns - Promise of array of payloads.
   */
  async transformMessageToPayload(
    notification: NotificationEntity,
    message: MessageEntity,
    receiver: MessageReceiverInfo,
    template: TemplateEntity,
  ): Promise<
    NotificationPayload<MailNotificationInfo, NotificationEmailOption>[]
  > {
    const mailNotifOpt: NotificationEmailOption = {
      title: template.title,
      content: template.content,
      variables: message.variables,
      email: receiver.email,
    }
    const transformedOpt = this.replaceVariables(mailNotifOpt, template)

    const unsubscribeToken = await this.redis.fetch(
      `unsubscribeToken:${receiver.email.value}`,
      CacheTimes.OneMonth,
      async () => {
        const token = cryptoRandomString({ length: 16, type: 'url-safe' })
        await this.redis.persist.set(
          token,
          JSON.stringify({ email: receiver.email.value }),
          'EX',
          getCacheTime(CacheTimes.OneMonth),
        )
        return token
      },
    )

    if (_.isUndefined(transformedOpt.variables)) {
      transformedOpt.variables = {}
    }
    transformedOpt.variables['unsubscribeToken'] = unsubscribeToken
    // If template is unsubscribable, unsubscribeToken will not be displayed in email template
    transformedOpt.variables['unsubscribable'] = template.unsubscribable
    const SenderReceiverInfo = {
      email: mailNotifOpt.email.value || receiver.email.value,
    }
    const content = transformedOpt.content
    const payload = {
      to: SenderReceiverInfo,
      subject: transformedOpt.title,
      variables: transformedOpt.variables,
      filesPaths: message.filesPaths ?? [],
    }
    let fullPayload: MailNotificationInfo
    if (content && !isNaN(+content)) {
      fullPayload = {
        ...payload,
        templateID: content ? +content : undefined,
      }
    } else {
      fullPayload = {
        ...payload,
        textPart: content,
      }
    }
    return [
      {
        id: notification.id.value,
        transportsOptions: mailNotifOpt,
        payload: fullPayload,
      },
    ]
  }
}
