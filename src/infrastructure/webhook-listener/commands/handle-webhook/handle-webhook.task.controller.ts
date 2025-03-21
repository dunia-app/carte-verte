import { Result } from '@badrap/result'
import {
  Controller,
  Injectable,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FastifyReply } from 'fastify'
import { from, lastValueFrom, mergeMap, take, tap, timer } from 'rxjs'
import { logger, pauseExec } from '../../../../helpers/application.helper'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { objectArrayToObjectArrayKey } from '../../../../helpers/object.helper'
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { OidcGuard } from '../../../guards/oicd.guard'
import { RedisService } from '../../../redis/redis.service'
import { WebhookRepository } from '../../database/webhook.repository'
import { HandleWebhookCommand } from './handle-webhook.command'
import Redlock = require('redlock')

const batchSize = 500
const maxIterations = 50
const prodOnly = false

//used for deployment
//must exactly match file name
const route = 'handle-webhook'
const schedule = '* * * * *'

@Controller(route)
@Injectable()
@SkipJWTAuth()
export class HandleWebhookController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly webhookRepo: WebhookRepository,
    readonly redis: RedisService,
  ) {}

  async handleWebhookProcess(
    lockName: string,
    redlock: Redlock.Lock | undefined,
    id: number,
  ): Promise<Redlock.Lock | undefined> {
    try {
      redlock = await this.redis.redlock.lock(
        lockName,
        getCacheTime(CacheTimes.FifteenMinutes, true),
      )

      await this.handleWebhookCommands()
    } catch (error: any) {
      //If one handle webhook failes (for example, because of a timeout), we want to continue with the next one
    } finally {
      if (redlock && redlock.expiration != 0) {
        await this.redis.redlock.unlock(redlock)
      }
      return redlock
    }
  }

  @UseGuards(new OidcGuard(route))
  @Post()
  async HandleWebhook(@Response() res: FastifyReply): Promise<void> {
    logger.info(`Starting ${route} controller...`)

    let redlock: Redlock.Lock | undefined

    const lockName = `lock:[${this.constructor.name}]:${route}`
    let nbIteration = 0

    try {
      await lastValueFrom(
        timer(0, 10000).pipe(
          take(6),
          mergeMap(() =>
            from(this.handleWebhookProcess(lockName, redlock, nbIteration)),
          ),
          tap((newLock) => {
            redlock = newLock
            nbIteration++
          }),
        ),
      )

      logger.info(`Ending ${route} controller`)
      res.status(200).send(Result.ok(0))
    } catch (error: any) {
      logger.error(`Error in ${route} controller ${error}`)
      res.status(500).send(error.message)
    }
  }

  private async handleWebhookCommands(): Promise<
    Result<number, ExceptionBase>
  > {
    const total = await this.webhookRepo.findManyToHandleCount()

    let commandResult: Result<number, ExceptionBase> = Result.ok(1)

    if (total !== 0) {
      let batchI = 0
      while (batchI < total) {
        const webhooksToHandle = await this.webhookRepo.findManyToHandle(
          batchSize,
        )

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
            commandResult = await this.handleWebhookCommand(webhook, eventType)
          }
          if (++i % maxIterations === 0) await pauseExec()
        }
        batchI += batchSize
      }
      return commandResult
    }

    return commandResult
  }

  private async handleWebhookCommand(
    webhook: any,
    eventType: string,
  ): Promise<Result<number, ExceptionBase>> {
    // One command for each webhook to avoid one long big transaction
    const webhookCommand = new HandleWebhookCommand({
      source: webhook.source,
      eventType: eventType,
      webhook: webhook,
    })
    let commandResult = await this.commandBus.execute(webhookCommand)
    if (commandResult.isErr) {
      throw commandResult.unwrap()
    }
    return commandResult
  }
}
