import { Global, Module } from '@nestjs/common'
import { CardAcquisitionService } from './card-acquisition-service'

@Global()
@Module({
  imports: [],
  providers: [CardAcquisitionService],
  exports: [CardAcquisitionService],
})
export class CardAcquisitionServiceModule {}
