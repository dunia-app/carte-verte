import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { CronExpression } from '@nestjs/schedule'
import { logger } from '../../../../helpers/application.helper'
import { getCacheTime } from '../../../../helpers/cache.helper'
import { ConditionalCron } from '../../../../helpers/cron.helper'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base'
import { SendMonthlyCashbackReceivedCommand } from '../../commands/send-monthly-cashback-received/send-monthly-cashback-received.command'

const cryptoRandomString = require('crypto-random-string')

import Redlock = require('redlock')

const taskName = 'send-monthly-cashback-received'

@Injectable()
export class SendMonthlyCashbackReceivedTaskHandler {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
  ) {}

  @ConditionalCron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, {
    name: 'send_monthly_casback_received',
  })
  async handleMonthlyCashbackReceivedToBeSent() {
    try {
      await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:handleMonthlyCashbackReceivedToBeSent`,
        getCacheTime(9.5, true),
      )
      const mealTicketReminderInput: CommandProps<SendMonthlyCashbackReceivedCommand> =
        {
          correlationId: cryptoRandomString({ length: 8 }),
        }
      const mealTicketReminderCommand = new SendMonthlyCashbackReceivedCommand(
        mealTicketReminderInput,
      )
      await this.commandBus.execute(mealTicketReminderCommand)
    } catch (e) {
      if (e instanceof Redlock.LockError) return
      logger.error(`[${this.constructor.name}]: Could not complete task`, e)
      throw e
    }
  }
}
