import { Controller, Injectable, Post, Response } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FastifyReply } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { getCacheTime } from '../../../../helpers/cache.helper'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base'
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator'
import { RenewCardAcquisitionPayinCommand } from './renew-card-acquisition-payin.command'
const cryptoRandomString = require('crypto-random-string')
import Redlock = require('redlock')

//used for deployment
const schedule = '0 01 * * *'
//must match exactly the file name
const route = 'renew-card-acquisition-payin'
const prodOnly = false

@Controller(route)
@Injectable()
@SkipJWTAuth()
export class RenewCardAcquisitionPayinController {
  constructor(
    private readonly commandBus: CommandBus,
    readonly redis: RedisService,
  ) {}

  // @UseGuards(new OidcGuard(route))
  @Post()
  async RenewCardAcquisitionPayin(
    @Response() res: FastifyReply,
  ): Promise<void> {
    logger.info(`Start task ${route} controller...`)
    let redlock: Redlock.Lock | undefined

    try {
      redlock = await this.redis.redlock.lock(
        `lock:[${this.constructor.name}]:${route}`,
        getCacheTime(60, true),
      )

      const input: CommandProps<RenewCardAcquisitionPayinCommand> = {
        correlationId: cryptoRandomString({ length: 8 }),
      }

      const command = new RenewCardAcquisitionPayinCommand(input)

      const commandResult = await this.commandBus.execute(command)

      if (commandResult.isErr) {
        logger.error(`Task ${route} failed: ${commandResult.unwrap()}`)
        res.status(400).send(commandResult.unwrap())
        return
      }

      logger.info(`Task ${route} completed successfully`)
      res.status(200).send(commandResult.unwrap())
    } catch (error) {
      logger.error(`Task ${route} failed: ${error}`)
      res.status(500).send(error)
    } finally {
      if (redlock) {
        await this.redis.redlock.unlock(redlock)
      }
    }
  }
}
