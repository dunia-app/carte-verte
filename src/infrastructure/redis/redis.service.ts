import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common'
import { RedisCache } from 'apollo-server-cache-redis'
import { RedisPubSub } from 'graphql-redis-subscriptions'

import { Redis } from 'ioredis'
import { logger } from '../../helpers/application.helper'
import { ConfigService } from '../config/config.service'
import Redlock = require('redlock')

@Injectable()
export class RedisService implements OnApplicationShutdown {
  public readonly apolloCache: RedisCache
  public readonly persist: any
  public readonly ioredis: any
  public readonly redlock: Redlock
  public readonly pubsub: RedisPubSub

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    try {
      const host = this.configService.getStr('REDIS_HOST')
      const port = Number(this.configService.getStr('REDIS_PORT'))
      const redis = new RedisCache({
        host,
        port,
        connectTimeout: 500,
        maxRetriesPerRequest: 1,
      })
      const redisPersist = new Redis({
        port,
        host,
        connectTimeout: 500,
        maxRetriesPerRequest: 1,
        db: 6,
      })
      this.redlock = new Redlock([redis.client] as any[], {
        retryCount: 3,
      })
      this.persist = redisPersist
      this.apolloCache = redis
      this.ioredis = redis.client as any
      this.pubsub = new RedisPubSub({
        connection: {
          host,
          port,
        },
      })
    } catch (e) {
      console.log('redisCache err ', e)
      throw e
    }
  }

  async flushCache() {
    return this.ioredis.flushdb()
  }

  async removeKeysByPattern(
    pattern: string,
    scanCount = 1000,
    withAsterixSuffix = true,
  ) {
    const stream = this.ioredis.scanStream({
      match: withAsterixSuffix ? `${pattern}*` : pattern,
      count: scanCount,
    })
    let pipeline = this.ioredis.pipeline()
    const promises: Promise<any>[] = []
    await new Promise((resolve, reject) => {
      stream.on('data', (resultKeys: string[]) => {
        pipeline.del(...resultKeys)
        promises.push(pipeline.exec())
        pipeline = this.ioredis.pipeline()
      })

      stream.on('end', () => {
        resolve(true)
      })
      stream.on('error', (e: any) => {
        logger.error(
          `[${this.constructor.name}]:removeKeysByPattern: redis remove by pattern error `,
          e,
        )
        reject(e)
      })
    })
    return Promise.all(promises)
  }

  private getCarteverteKey(key: string) {
    return `carteverte:${key}`
  }

  async get(key: string, toJSON = true) {
    const result = await this.ioredis.get(this.getCarteverteKey(key))
    if (!result) return null

    return toJSON ? JSON.parse(result) : result
  }

  async set(key: string, value: any, seconds: number, stringify = true) {
    try {
      const savedValue = stringify ? JSON.stringify(value) : value
      await this.ioredis.set(
        this.getCarteverteKey(key),
        savedValue,
        'EX',
        seconds,
      )
      return true
    } catch (e) {
      logger.error(
        `[${
          this.constructor.name
        }]:SET: Could not set key ${this.getCarteverteKey(key)}`,
        e,
      )
      return false
    }
  }

  /**
   * read a value from cache based on the given key
   * if value was not found then use the getValueCallback to compute/find it
   * write value into cache and return it
   */
  async fetch<T>(
    cacheKey: string,
    seconds: number,
    getValueCallback: () => Promise<T>,
    awaitForCacheWrite = true,
    stringify = true,
  ): Promise<T> {
    const cacheResult = await this.get(cacheKey, stringify)
    if (cacheResult) return cacheResult

    const value = await getValueCallback()

    if (awaitForCacheWrite) {
      await this.set(cacheKey, value, seconds, stringify)
    } else {
      this.set(cacheKey, value, seconds, stringify)
    }
    return value
  }

  async del(...keys: string[]) {
    return this.ioredis.del(...keys)
  }

  async onApplicationShutdown() {
    await Promise.all([this.pubsub.close(), this.persist.quit()])
    return this.apolloCache.close()
  }
}
