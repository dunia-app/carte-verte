import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { BaasHealthIndicator } from './baas.healthcheck.indicator'
import { HealthcheckController } from './healthcheck.controller'

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthcheckController],
  providers: [BaasHealthIndicator],
})
export class HealthcheckModule {}
