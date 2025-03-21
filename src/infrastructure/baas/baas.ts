import { Injectable } from '@nestjs/common'
import { TreezorBaas } from '../../libs/ddd/infrastructure/baas/treezor.baas.base'
import { ConfigService } from '../config/config.service'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class Baas extends TreezorBaas {
    constructor(config: ConfigService, redis: RedisService){
        super(config, redis)
    }
}
