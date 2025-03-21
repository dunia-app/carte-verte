import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsNumber } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateCardLimitAdminRequest {
  @Field(() => Float)
  @IsNumber()
  readonly limitPaymentDay!: number

  @Field(() => Float)
  @IsNumber()
  readonly paymentDailyLimit!: number
}
