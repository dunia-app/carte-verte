import { Injectable } from '@nestjs/common'
import { StripePaymentService } from '../../libs/ddd/infrastructure/payment-service/stripe.payment-service.base'

@Injectable()
export class PaymentService extends StripePaymentService {}
