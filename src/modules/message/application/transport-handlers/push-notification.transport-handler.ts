import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import {
  PushNotifEmitter,
  TokenMessage,
} from '../../../../infrastructure/push-notif-emitter/push-notif-emitter'
import {
  MessageReceiverInfo,
  NotificationPayload,
  NotificationResponse,
  NotificationTransportHandler,
} from '../../../../libs/ddd/domain/base-classes/transport-handler.base'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import {
  NotificationPushOption,
  NotificationSendingResult,
} from '../../domain/entities/notification.types'
import { TemplateEntity } from '../../domain/entities/template.entity'
import { NotificationResponseVO } from '../../domain/value-objects/notification-response.value-object'

const defaultNotifTitle = 'Carte verte'

@Injectable()
export class PushNotificationTransportService extends NotificationTransportHandler<
  TokenMessage,
  NotificationPushOption
> {
  constructor(private readonly pushNotifEmitter: PushNotifEmitter) {
    super()
  }
  async sendMessages(
    messages: NotificationPayload<TokenMessage, NotificationPushOption>[],
  ): Promise<NotificationResponse[]> {
    const batches = _.chunk(messages, 500)
    const promises = []
    const successResults: NotificationResponse[] = []

    for (let i = 0; i < batches.length; i++) {
      promises.push(
        this.pushNotifEmitter
          .messaging()
          .sendEach(batches[i].map((it) => it.payload))
          .then((res) => {
            return { response: res, index: i }
          }),
      )
    }

    const batchResults = await Promise.all(promises)

    // handle results
    for (const it of batchResults) {
      const responsesItems = it.response.responses
      for (let i = 0; i < responsesItems.length; i++) {
        const respItem = responsesItems[i]
        const messageItem = messages[i + it.index]
        const deviceToken = messageItem.payload.token

        const deviceResult: TWithStringKeys = {}
        if (respItem.messageId) {
          deviceResult.externalId = respItem.messageId
        } else {
          deviceResult.errorCode = respItem.error?.code
          deviceResult.message = respItem.error?.message
        }

        let resultByDeviceToken: TWithStringKeys = {}
        const existingResult = successResults.find(
          (result) => result.id === messageItem.id,
        )
        if (existingResult) {
          resultByDeviceToken = existingResult.response.resultObject
        }

        resultByDeviceToken[deviceToken] = deviceResult

        if (existingResult) {
          existingResult.response.resultObject = resultByDeviceToken
        } else {
          successResults.push({
            id: messageItem.id,
            response: new NotificationResponseVO({
              result: respItem.success
                ? NotificationSendingResult.SUCCESS
                : NotificationSendingResult.ERROR,
              errorCode: respItem.error?.code,
              resultObject: resultByDeviceToken,
            }),
          })
        }
      }
    }
    return successResults
  }

  async transformMessageToPayload(
    notification: NotificationEntity,
    message: MessageEntity,
    receiver: MessageReceiverInfo,
    template: TemplateEntity,
  ): Promise<NotificationPayload<TokenMessage, NotificationPushOption>[]> {
    const pushNotifOpt: NotificationPushOption = {
      title: template.title ? template.title : defaultNotifTitle,
      content: template.content,
      variables: message.variables,
      deviceTokens: receiver.deviceTokens,
    }
    const transformedOpt = this.replaceVariables(pushNotifOpt, template)

    if (template.link) {
      transformedOpt.link = this.handleVariables(
        template.link,
        message.variables,
      )
    }
    if (isUndefined(transformedOpt.variables)) {
      transformedOpt.variables = {}
    }

    return receiver.deviceTokens.map((token) => {
      const pushNotif: TokenMessage['notification'] = {
        body: transformedOpt.content,
        title: transformedOpt.title,
      }
      const result: NotificationPayload<TokenMessage, NotificationPushOption> =
        {
          id: notification.id.value,
          transportsOptions: transformedOpt,
          payload: {
            token,
            notification: pushNotif,
          },
        }
      if (transformedOpt.link) {
        result.payload.data = { link: transformedOpt.link }
      }
      return result
    })
  }
}
