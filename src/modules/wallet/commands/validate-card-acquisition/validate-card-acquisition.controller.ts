import {
  Controller,
  Get,
  Injectable,
  Query,
  Response,
  UseInterceptors,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'

import { CommandBus } from '@nestjs/cqrs'
import { TimeoutLoggerInterceptor } from '../../../../infrastructure/interceptors/timeout-logger.interceptor'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator'

@Controller('card-acquisition')
@Injectable()
@SkipJWTAuth()
@UseInterceptors(TimeoutLoggerInterceptor)
export class ValidateCardAcquisitionController {
  constructor(
    private readonly redis: RedisService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/validate')
  async validateCardAcquisition(
    @Query('orderid') orderId: string,
    @Response() resp: FastifyReply,
  ) {
    // const cardAcquisitionConfig = await this.redis.get(orderId)

    // if (!cardAcquisitionConfig) {
    //   return resp
    //     .status(302)
    //     .redirect('https://ekip.app/card-acquisition/failure')
    // }

    // const command = new ValidateCardAcquisitionCommand({
    //   employeeId: cardAcquisitionConfig.employeeId,
    //   externalEmployeeId: cardAcquisitionConfig.externalEmployeeId,
    //   orderId: orderId,
    // })

    // const res = await this.commandBus.execute(command)

    // if (res.isOk) {
    //   this.redis.del(orderId)
    return resp
      .status(302)
      .redirect('https://ekip.app/card-acquisition/success')
    // } else {
    //   return resp
    //     .status(302)
    //     .redirect('https://ekip.app/card-acquisition/failure')
    // }
  }

  @Get('/decline')
  async declineCardAcquisition(
    @Query('orderid') orderId: string,
    @Response() resp: FastifyReply,
  ) {
    // this.redis.del(orderId)
    return resp
      .status(302)
      .redirect('https://ekip.app/card-acquisition/decline')
  }
}
