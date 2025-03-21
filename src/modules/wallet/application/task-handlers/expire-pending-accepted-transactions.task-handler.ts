import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CronExpression } from '@nestjs/schedule';
import { logger } from '../../../../helpers/application.helper';
import { getCacheTime } from '../../../../helpers/cache.helper';
import { ConditionalCron } from '../../../../helpers/cron.helper';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base';
import { ExpirePendingAcceptedTransactionsCommand } from '../../commands/expire-pending-accepted-transactions/expire-pending-accepted-transactions.command';
const cryptoRandomString = require('crypto-random-string');
import Redlock = require('redlock')

const taskName = 'expire-pending-accepted-transactions' ;

@Injectable()
export class ExpirePendingAcceptedTransactionsTaskHandler {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
  ) {}

  @ConditionalCron(CronExpression.EVERY_DAY_AT_2AM, {
    name: taskName,
  })
  async handlePendingAcceptedTransactionsToBeExpired() {
    let redlock: Redlock.Lock | undefined ;

    try {
      redlock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:${taskName}`,
        getCacheTime(60, true),
      )

      const now = new Date().toISOString();
      logger.info(`[${this.constructor.name}]: Start task ${taskName} at time ${now}`);

      const input: CommandProps<ExpirePendingAcceptedTransactionsCommand> = {
        correlationId: cryptoRandomString({ length: 8 }),
      }
      const command = new ExpirePendingAcceptedTransactionsCommand(input)
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
