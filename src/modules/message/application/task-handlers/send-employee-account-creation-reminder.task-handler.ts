import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CronExpression } from '@nestjs/schedule';
import { logger } from '../../../../helpers/application.helper';
import { getCacheTime } from '../../../../helpers/cache.helper';
import { ConditionalCron } from '../../../../helpers/cron.helper';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base';
import { SendEmployeeAccountCreationReminderCommand } from '../../commands/send-employee-account-creation-reminder/send-employee-account-creation-reminder.command';
const cryptoRandomString = require('crypto-random-string');
;
import Redlock = require('redlock');

const taskName = 'send-employee-account-creation-reminder'

@Injectable()
export class SendEmployeeAccountCreationReminderTaskHandler {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
  ) {}

  @ConditionalCron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: taskName,
  })
  async handleEmployeeAccountCreationReminderToBeSent() {
    let redlock: Redlock.Lock | undefined
    try {
      redlock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:${taskName}`,
        getCacheTime(9.5, true),
      )

      const now = new Date().toISOString()
      logger.info(`[${this.constructor.name}]: Start task ${taskName} at time ${now}`)

      const employeeAccountCreationReminderInput: CommandProps<SendEmployeeAccountCreationReminderCommand> =
        {
          correlationId: cryptoRandomString({ length: 8 }),
        }
      const employeeAccountCreationReminderCommand =
        new SendEmployeeAccountCreationReminderCommand(
          employeeAccountCreationReminderInput,
        )
      await this.commandBus.execute(employeeAccountCreationReminderCommand)
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
