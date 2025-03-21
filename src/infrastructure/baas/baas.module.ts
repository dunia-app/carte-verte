import { Global, Module } from '@nestjs/common'
import { Baas } from './baas'

@Global()
@Module({
  imports: [],
  providers: [Baas],
  exports: [Baas],
})
export class BaasModule {}
