import { Global, Module } from '@nestjs/common'
import { UnitOfWork } from './unit-of-work'

@Global()
@Module({
  imports: [],
  providers: [UnitOfWork],
  exports: [UnitOfWork],
})
export class UnitOfWorkModule {}
