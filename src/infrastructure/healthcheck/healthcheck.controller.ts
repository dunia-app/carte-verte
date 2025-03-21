import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus'
import { SkipJWTAuth } from '../../libs/decorators/auth.decorator'
import { BaasHealthIndicator } from './baas.healthcheck.indicator'

@Controller('healthcheck')
@SkipJWTAuth()
export class HealthcheckController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private baas: BaasHealthIndicator,
  ) {}

  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.db.pingCheck('database')])
  }

  @Get('http')
  @HealthCheck()
  checkHttp() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ])
  }

  @Get('baas')
  @HealthCheck()
  checkBaas() {
    return this.health.check([() => this.baas.isBaasUp('baas')])
  }
}
