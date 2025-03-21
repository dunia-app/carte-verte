import { Injectable } from '@nestjs/common'
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus'
import { Baas } from '../baas/baas'

@Injectable()
export class BaasHealthIndicator extends HealthIndicator {
  constructor(private readonly baas: Baas) {
    super()
  }

  async isBaasUp(key: string): Promise<HealthIndicatorResult> {
    const isBaasUp = await this.baas.healthcheck()
    const result = this.getStatus(key, isBaasUp)

    if (isBaasUp) {
      return result
    }
    throw new HealthCheckError('Baascheck failed', result)
  }
}
