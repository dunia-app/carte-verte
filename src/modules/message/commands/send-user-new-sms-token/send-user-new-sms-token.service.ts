import { UnprocessableEntityException } from '@nestjs/common';
import { logger } from '../../../../helpers/application.helper';
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper';
import { ConfigService } from '../../../../infrastructure/config/config.service';
import { MessageEmitter } from '../../../../infrastructure/message-emitter/message-emitter';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { SmsEmitter } from '../../../../infrastructure/sms-emitter/sms-emitter';
import { EmployeeAskNewSmsTokenDomainEvent } from '../../../organization/domain/events/employee-ask-new-sms-token.domain-event';
const cryptoRandomString = require('crypto-random-string');

export async function sendUserNewSmsToken(
  redisService: RedisService,
  configService: ConfigService,
  smsEmitter: SmsEmitter,
  messageEmitter: MessageEmitter,
  event: EmployeeAskNewSmsTokenDomainEvent,
) {
  const demoTel = configService.get('DEMO_TEL')
  const appTestTel = configService.getStr('APP_TEST_TEL')
  const isDemoTel = demoTel === event.mobile
  const isAppTestTel = appTestTel === event.mobile
  const isDebug = configService.isDebug()

  const code = isDemoTel
    ? configService.getStr('DEMO_CODE')
    : isDebug && isAppTestTel
    ? configService.getStr('APP_TEST_CODE')
    : cryptoRandomString({ length: 6, type: 'numeric' })

  const authInfo = {
    code,
    mobile: event.mobile,
    email: event.email,
    employeeId: event.aggregateId,
    deviceId: event.deviceId,
  }

  const promises: Promise<any>[] = [
    redisService.persist.set(
      event.mobileToken,
      JSON.stringify(authInfo),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    ),
  ]
  if (!(isDemoTel || (isDebug && isAppTestTel))) {
    // code.replace to have a - every 3 code caracters
    // And slice to remove the last one
    promises.push(
      smsEmitter.sendSMS(
        event.mobile,
        `Votre code : ${code
          .replace(/.{3}/g, '$&-')
          .slice(0, -1)} (il expirera dans 15 minutes)`,
      ),
    )
  }

  try {
    await Promise.all(promises)
  } catch (e: any) {
    const message = `Could not send sms code`
    const context = 'authentification'
    logger.error(`${context}: ${message}`, e)
    messageEmitter.sendErrorLog(message, e, context)
    throw new UnprocessableEntityException(e)
  }
}
