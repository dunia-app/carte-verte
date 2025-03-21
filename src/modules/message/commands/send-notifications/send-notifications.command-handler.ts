import { CommandHandler } from '@nestjs/cqrs'
import _ from 'lodash'
import { logger, pauseExec } from '../../../../helpers/application.helper'
import { getCacheTime } from '../../../../helpers/cache.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import {
  NotificationPayload,
  NotificationResponse,
  NotificationTransportHandler,
} from '../../../../libs/ddd/domain/base-classes/transport-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { InAppNotificationTransportService } from '../../application/transport-handlers/in-app-notification.transport-handler'
import { MailNotificationTransportService } from '../../application/transport-handlers/mail-notification.transport-handler'
import { PushNotificationTransportService } from '../../application/transport-handlers/push-notification.transport-handler'
import { SmsNotificationTransportService } from '../../application/transport-handlers/sms-notification.transport-handler'
import { MessageRepositoryPort } from '../../database/message/message.repository.port'
import { NotificationRepositoryPort } from '../../database/notification/notification.repository.port'
import { ReceiverRepositoryPort } from '../../database/receiver/receiver.repository.port'
import { TemplateRepositoryPort } from '../../database/template/template.repository.port'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import {
  NotificationSendingResult,
  NotificationType,
} from '../../domain/entities/notification.types'
import { SendNotificationsCommand } from './send-notifications.command'
import fs = require('fs')
import Redlock = require('redlock')

type MessageByTransportMap = Map<
  NotificationType,
  NotificationPayload<any, any>[]
>

@CommandHandler(SendNotificationsCommand)
export class SendNotificationCommandHandler extends CommandHandlerBase {
  handleTransports: {
    [key in NotificationType]: NotificationTransportHandler<any, any>
  }
  maxIterations = 1000
  batchSize = 5000

  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly redis: RedisService,
    protected readonly mailNotifHandler: MailNotificationTransportService,
    protected readonly pushNotifHandler: PushNotificationTransportService,
    protected readonly inAppNotifHandler: InAppNotificationTransportService,
    protected readonly smsNotifHandler: SmsNotificationTransportService,
  ) {
    super(unitOfWork)
    this.handleTransports = {
      [NotificationType.PUSH]: pushNotifHandler,
      [NotificationType.IN_APP]: inAppNotifHandler,
      [NotificationType.MAIL]: mailNotifHandler,
      [NotificationType.SMS]: smsNotifHandler,
    }
  }

  protected logTransaction: boolean = false

  async handle(
    command: SendNotificationsCommand,
  ): Promise<Result<null, ExceptionBase>> {
    try {
      const lock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:handle`,
        getCacheTime(30, true),
      )
      /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
      const notificationRepo: NotificationRepositoryPort =
        this.unitOfWork.getNotificationRepository(command.correlationId)

      const messageRepo: MessageRepositoryPort =
        this.unitOfWork.getMessageRepository(command.correlationId)

      const templateRepo: TemplateRepositoryPort =
        this.unitOfWork.getTemplateRepository(command.correlationId)

      const receiverRepo: ReceiverRepositoryPort =
        this.unitOfWork.getReceiverRepository(command.correlationId)

      const templateMap = await templateRepo.getTemplateMap()

      const notificationToIdMap = new Map<string, NotificationEntity>()

      for (let batchI = 0; batchI < command.total; batchI += this.batchSize) {
        const messagesByTransport: MessageByTransportMap = new Map()

        // getMessages
        try {
          const newNotifications = await notificationRepo.messagesToBeSent(
            command.lessThanDate,
            this.batchSize,
          )
          const messagesMap = await messageRepo.getFindManyByIdMapById(
            _.uniq(newNotifications.map((it) => it.messageId.value)),
          )
          const receiversMap = await receiverRepo.getFindManyByIdMapById(
            _.uniq(
              Array.from(messagesMap.values()).map((it) => it.receiverId.value),
            ),
          )

          const notificationNotToSend: NotificationEntity[] = []

          for (let i = 0; i < newNotifications.length; i++) {
            const notification = newNotifications[i]
            const messageInfo = messagesMap.get(notification.messageId.value)
            if (isUndefined(messageInfo)) continue
            const receiverInfo = receiversMap.get(messageInfo.receiverId.value)
            if (isUndefined(receiverInfo)) continue

            // If one of the files to send is missing we skip the notification
            if (messageInfo && messageInfo.filesPaths) {
              const fileDoesNotExist = messageInfo.filesPaths.some(
                (filePath) => !fs.existsSync(filePath),
              )
              if (fileDoesNotExist) {
                notification.setFailedToSendAt()
                notification.setResponse({
                  result: NotificationSendingResult.ERROR,
                })
                notificationNotToSend.push(notification)
                continue
              }
            }
            if (
              !messageInfo.skipReceiverConsent &&
              ((notification.type === NotificationType.PUSH &&
                !receiverInfo.acceptNotification) ||
                (notification.type === NotificationType.MAIL &&
                  !receiverInfo.acceptEmail))
            ) {
              notification.setFailedToSendAt()
              notification.setResponse({
                result: NotificationSendingResult.TURNED_OFF,
              })
              notificationNotToSend.push(notification)
              continue
            }
            const templateForTemplateName =
              templateMap[messageInfo.templateName]
            const templatesForNotificationType = _.filter(
              templateForTemplateName,
              (content) => content.acceptNotificationType(notification.type),
            )
            if (templatesForNotificationType.length < 1) {
              logger.error(
                `No template found for name ${messageInfo.templateName} and transport ${notification.type}.`,
                `[${this.constructor.name}]:getMessage`,
              )
              continue
            }
            const template = _.sample(templatesForNotificationType)
            const handler = this.handleTransports[notification.type]
            const messages = messagesByTransport.get(notification.type) || []

            const messagePayload = await handler.transformMessageToPayload(
              notification,
              messageInfo,
              receiverInfo,
              template,
            )
            if (!messagePayload || messagePayload.length === 0) {
              notification.setFailedToSendAt()
              notification.setResponse({
                result: NotificationSendingResult.ERROR,
                errorCode: 'Unable to generate message payload',
              })
              notificationNotToSend.push(notification)
              continue
            }
            messages.push(...messagePayload)

            messagesByTransport.set(notification.type, messages)
            notificationToIdMap.set(notification.id.value, notification)

            if (i % this.maxIterations === 0) await pauseExec()
          }
          const inAppMessages = messagesByTransport.get(NotificationType.IN_APP)
          const inApp = inAppMessages ? inAppMessages.length : 0
          if (inApp > 0) {
            logger.log(`[${this.constructor.name}]: ${inApp} IN_APP to be sent`)
          }
          const pushMessages = messagesByTransport.get(NotificationType.PUSH)
          const push = pushMessages ? pushMessages.length : 0
          if (push > 0) {
            logger.log(`[${this.constructor.name}]: ${push} PUSH to be sent`)
          }
          const mailMessages = messagesByTransport.get(NotificationType.MAIL)
          const mail = mailMessages ? mailMessages.length : 0
          if (mail > 0) {
            logger.log(`[${this.constructor.name}]: ${mail} MAIL to be sent`)
          }
          notificationRepo.saveMultiple(notificationNotToSend)
        } catch (e) {
          logger.error(
            `[${this.constructor.name}]: Could not get and transform messages`,
            e,
          )
          throw e
        }
        // getMessages

        const promises = []
        for (const [transport, messages] of messagesByTransport) {
          const handler = this.handleTransports[transport]
          if (!handler) continue
          promises.push(handler.sendMessages(messages))
        }
        const transportResults = await Promise.allSettled(promises)
        const transportResultsSuccess = transportResults
          .map((promise) => {
            if (promise.status === 'fulfilled') {
              return promise.value
            } else {
              logger.error(
                `Unable to send all messages : ${promise.reason}`,
                `[${this.constructor.name}]:handleNewNotificationEntitys`,
              )
            }
          })
          .filter((item): item is NotificationResponse[] => !isUndefined(item))
          .flat()

        const idIndexMap = new Map<string, number>()
        const toUpdate: NotificationEntity[] = []

        try {
          for (let i = 0; i < transportResultsSuccess.length; i++) {
            const notificationResponse = transportResultsSuccess[i]
            const prevItemIndex = idIndexMap.get(notificationResponse.id)

            if (prevItemIndex !== undefined) {
              toUpdate[prevItemIndex] = _.merge(
                toUpdate[prevItemIndex],
                notificationResponse,
              )
            } else {
              const originalItem = notificationToIdMap.get(
                notificationResponse.id,
              )
              if (isUndefined(originalItem)) {
                continue
              }
              if (isUndefined(originalItem.response)) {
                originalItem.setResponse(notificationResponse.response)
                originalItem.setSentAt()
              } else {
                originalItem.setResponse({
                  result: originalItem.response.result,
                  errorCode: originalItem.response.errorCode,
                  resultObject: {
                    ...originalItem.response.resultObject,
                    ...notificationResponse.response.resultObject,
                  },
                })
              }
              toUpdate.push(originalItem)
              idIndexMap.set(notificationResponse.id, toUpdate.length - 1)
            }

            if (i % this.maxIterations === 0) await pauseExec()
          }
          await notificationRepo.saveMultiple(toUpdate)
        } catch (e) {
          logger.error(
            `[${this.constructor.name}]: Could not merge and update message results`,
            e,
          )
          throw e
        }

        // mergeAndUpdateResults
      }
      await this.redis.redlock.unlock(lock)
      return Result.ok(null)
    } catch (e) {
      if (e instanceof Redlock.LockError) return Result.ok(null)
      logger.error(`[${this.constructor.name}]: Could not complete task`, e)
      throw e
    }
  }
}
