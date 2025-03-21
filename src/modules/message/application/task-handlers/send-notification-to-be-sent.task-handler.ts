import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CronExpression } from '@nestjs/schedule';
import { logger } from '../../../../helpers/application.helper';
import { getCacheTime } from '../../../../helpers/cache.helper';
import { ConditionalCron } from '../../../../helpers/cron.helper';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base';
import { SendNotificationsCommand } from '../../commands/send-notifications/send-notifications.command';
import { NotificationRepository } from '../../database/notification/notification.repository';
const cryptoRandomString = require('crypto-random-string');
import moment = require('moment')
import Redlock = require('redlock');

const taskName = 'send-notifications-to-be-sent'

@Injectable()
export class SendNotificationToBeSentTaskHandler {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
    private readonly notificationRepo: NotificationRepository,
  ) {}

  @ConditionalCron(CronExpression.EVERY_10_SECONDS, {
    name: taskName,
  })
  async handleNotificationsToBeSent() {
    let redlock: Redlock.Lock | undefined ;

    try {
      redlock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:${taskName}`,
        getCacheTime(9.5, true),
      )

      const now = new Date().toISOString();
      logger.info(`[${this.constructor.name}]: Start task ${taskName} at time ${now}`);

      const lessThanDate = moment().add(5, 'seconds').toDate()
      const total = await this.notificationRepo.messagesToBeSentCount(
        lessThanDate,
      )
      if (total === 0) return
      const input: CommandProps<SendNotificationsCommand> = {
        correlationId: cryptoRandomString({ length: 8 }),
        total: total,
        lessThanDate: lessThanDate,
      }
      const command = new SendNotificationsCommand(input)
      await this.commandBus.execute(command)
    } catch (e) {
      if (e instanceof Redlock.LockError) return
      logger.error(`[${this.constructor.name}]: Could not complete task`, e)
      throw e
    } finally {
      if (redlock) {
        await this.redis.redlock.unlock(redlock)
      }
    }
  }
}
