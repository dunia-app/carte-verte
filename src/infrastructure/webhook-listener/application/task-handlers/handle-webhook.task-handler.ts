import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CronExpression } from '@nestjs/schedule';
import { logger, pauseExec } from '../../../../helpers/application.helper';
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper';
import { ConditionalCron } from '../../../../helpers/cron.helper';
import { objectArrayToObjectArrayKey } from '../../../../helpers/object.helper';
import { RedisService } from '../../../redis/redis.service';
import { HandleWebhookCommand } from '../../commands/handle-webhook/handle-webhook.command';
import { WebhookRepository } from '../../database/webhook.repository';
import Redlock = require('redlock');

const batchSize = 500 ;
const maxIterations = 50 ; 
const taskName = 'handle-webhook' ;

@Injectable()
export class HandleWebhookTaskHandler {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
    private readonly webhookRepo: WebhookRepository,
  ) {}

  @ConditionalCron(CronExpression.EVERY_10_SECONDS, {
    name: taskName,
  })
  async handleWebhook() {
    let redlock: Redlock.Lock | undefined ;
    try {
      redlock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:${taskName}`,
        getCacheTime(CacheTimes.FifteenMinutes, true),
      )

      const now = new Date().toISOString();
      logger.info(`[${this.constructor.name}]: Start task ${taskName} at time ${now}`);

      const total = await this.webhookRepo.findManyToHandleCount()
      if (total !== 0) {
        let batchI = 0
        while (batchI < total) {
          const webhooksToHandle = (await this.webhookRepo.findManyToHandle(
            batchSize,
          ))

          const webhooksByType = Object.entries(
            objectArrayToObjectArrayKey(
              webhooksToHandle,
              undefined,
              (webhook) => webhook.event.webhook,
            ),
          )
          let i = 0
          for (const [eventType, webhooks] of webhooksByType) {
            for (const webhook of webhooks) {
              // One command for each webhook to avoid one long big transaction
              const webhookCommand = new HandleWebhookCommand({
                source: webhook.source,
                eventType: eventType,
                webhook: webhook,
              })
              await this.commandBus.execute(webhookCommand)
            }
            if (++i % maxIterations === 0) await pauseExec()
          }
          batchI += batchSize
        }
      }
      logger.info(
        `[${
          this.constructor.name
        }]: Task started at ${now} stopped at time ${new Date().toISOString()} after ${total} webhooks`,
      )
    } catch (e) {
      if (e instanceof Redlock.LockError) return
      logger.error(`[${this.constructor.name}]: Could not complete task`, e)
      throw e
    } finally {
      if (redlock) {
        await this.redis.redlock.release(redlock)
      }
    }
  }
}
