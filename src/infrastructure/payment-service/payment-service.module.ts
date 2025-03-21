import { Global, Module } from '@nestjs/common'
import { PaymentService } from './payment-service'

@Global()
@Module({
  imports: [],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentServiceModule {}
