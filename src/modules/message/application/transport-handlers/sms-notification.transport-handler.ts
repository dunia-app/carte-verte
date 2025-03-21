import { Injectable } from '@nestjs/common'
import { messaging } from 'firebase-admin'
import { MessageEmitter } from '../../../../infrastructure/message-emitter/message-emitter'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import {
  MessageReceiverInfo,
  NotificationPayload,
  NotificationResponse,
  NotificationTransportHandler,
} from '../../../../libs/ddd/domain/base-classes/transport-handler.base'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import { NotificationSmsOption } from '../../domain/entities/notification.types'
import { TemplateEntity } from '../../domain/entities/template.entity'

type TokenMessage = messaging.Message & { token: string }

@Injectable()
export class SmsNotificationTransportService extends NotificationTransportHandler<
  TokenMessage,
  NotificationSmsOption
> {
  constructor(
    private readonly messageEmitter: MessageEmitter,
    private readonly redis: RedisService,
  ) {
    super()
  }
  async sendMessages(
    messages: NotificationPayload<TokenMessage, NotificationSmsOption>[],
  ): Promise<NotificationResponse[]> {
    throw new Error('Not implemented yet.')
  }

  async transformMessageToPayload(
    notification: NotificationEntity,
    message: MessageEntity,
    receiver: MessageReceiverInfo,
    template: TemplateEntity,
  ): Promise<NotificationPayload<TokenMessage, NotificationSmsOption>[]> {
    throw new Error('Not implemented yet.')
  }
}
