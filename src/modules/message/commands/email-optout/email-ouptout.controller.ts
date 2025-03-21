import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Response,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator'
import { ReceiverRepository } from '../../database/receiver/receiver.repository'

@Controller('email-optout')
export class EmailOptoutController {
  constructor(
    private readonly receiverService: ReceiverRepository,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  @SkipJWTAuth()
  @Get(':unsubscribeToken')
  async emailOptOut(
    @Response() res: FastifyReply,
    @Param('unsubscribeToken') unsubscribeToken: string,
  ) {
    const json = await this.redis.persist.get(unsubscribeToken)
    try {
      if (!json) {
        throw new Error('Token expired')
      }
      const { email } = JSON.parse(json)

      const receiver = await this.receiverService.findOneByEmail(email)

      if (!receiver) {
        throw new NotFoundException('User with this email does not exists')
      }
      receiver.acceptEmail = false
      await this.receiverService.save(receiver)
    } catch (e) {
      logger.error(`[${this.constructor.name}]: emailOptOut: ${e}`)
      res.status(302).redirect(`${this.config.getStr('APP_URL')}/404/`)
      return
    }
    res.status(302).redirect(`${this.config.getStr('APP_URL')}/unsubscribe/`)
  }
}
