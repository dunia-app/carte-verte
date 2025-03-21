import { Global, Module } from '@nestjs/common'
import { RedisResolver } from './redis.resolver'
import { RedisService } from './redis.service'

@Global()
@Module({
  providers: [RedisService, RedisResolver],
  exports: [RedisService],
})
export class RedisModule {}