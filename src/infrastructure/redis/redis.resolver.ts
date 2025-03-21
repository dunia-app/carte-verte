import { Resolver } from '@nestjs/graphql'
import { AppMutation } from '../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../modules/user/domain/entities/user.types'
import { RedisService } from './redis.service'

@Resolver()
export class RedisResolver {
  constructor(private readonly service: RedisService) {}

  @AppMutation(() => String, UserRoles.superAdmin)
  async resetCache() {
    return this.service.ioredis.flushdb()
  }
}
