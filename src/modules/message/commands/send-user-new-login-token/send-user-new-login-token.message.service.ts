const cryptoRandomString = require('crypto-random-string');
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper';
import { ConfigService } from '../../../../infrastructure/config/config.service';
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { EmployeeAskNewLoginTokenDomainEvent } from '../../../organization/domain/events/employee-ask-new-login-token.domain-event';
import { EmployeeAskResetCodeDomainEvent } from '../../../organization/domain/events/employee-ask-reset-code.domain-event';
import { EmployeeCodeTooManyFailedAttemptDomainEvent } from '../../../organization/domain/events/employee-code-too-many-failed-attempt.domain-event';
import { MessageRepositoryPort } from '../../database/message/message.repository.port';
import { NotificationRepositoryPort } from '../../database/notification/notification.repository.port';
import { ReceiverRepositoryPort } from '../../database/receiver/receiver.repository.port';
import { MessageEntity } from '../../domain/entities/message.entity';
import { NotificationType } from '../../domain/entities/notification.types';
import {
  MessageTemplateName,
  templateNameToAppUrl,
} from '../../domain/entities/template.types';

const templateName: MessageTemplateName =
  MessageTemplateName.EMPLOYEE_NEW_LOGIN_TOKEN

let variables: { token: string; urlToken: string }

const notificationTypes: NotificationType[] = [NotificationType.MAIL]

function getWillSendAt(): Date {
  return new Date()
}

export async function sendUserNewLoginToken(
  unitOfWork: UnitOfWork,
  redisService: RedisService,
  configService: ConfigService,
  event:
    | EmployeeAskResetCodeDomainEvent
    | EmployeeAskNewLoginTokenDomainEvent
    | EmployeeCodeTooManyFailedAttemptDomainEvent,
) {
  if(!event.correlationId){
    throw new Error('CorrelationId is required')
  }

  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    event.correlationId,
  )

  const receiver = await receiverRepo.findOneByUserIdOrThrow(event.userId)

  const messageRepo: MessageRepositoryPort = unitOfWork.getMessageRepository(
    event.correlationId,
  )

  const notificationRepo: NotificationRepositoryPort =
    unitOfWork.getNotificationRepository(event.correlationId)

  const playstoreDemoEmail = configService.getStr('PLAYSTORE_DEMO_EMAIL')
  const applestoreDemoEmail = configService.getStr('APPLESTORE_DEMO_EMAIL')
  const isDemoEmail =
    receiver.email.value === playstoreDemoEmail ||
    receiver.email.value === applestoreDemoEmail

  const loginToken = isDemoEmail
    ? configService.getStr('DEMO_EMAIL_TOKEN')
    : cryptoRandomString({ length: 10, type: 'numeric' })

  redisService.persist.set(
    loginToken,
    JSON.stringify({ email: receiver.email.value }),
    'EX',
    getCacheTime(CacheTimes.OneWeek),
  )

  variables = {
    token: loginToken,
    urlToken: templateNameToAppUrl(templateName, {
      token: loginToken,
      email: receiver.email.value,
    }),
  }
  if (!isDemoEmail) {
    const message = MessageEntity.create({
      receiverId: receiver.id,
      templateName: templateName,
      variables: variables,
      skipReceiverConsent: true,
      notificationsProps: notificationTypes.map((type) => {
        return {
          type: type,
          willSendAt: getWillSendAt(),
        }
      }),
    })
    await messageRepo.save(message.message)
    await notificationRepo.saveMultiple(message.notifications)
  }
}
