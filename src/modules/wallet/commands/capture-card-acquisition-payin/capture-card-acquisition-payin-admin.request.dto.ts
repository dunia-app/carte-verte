import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsNumber, IsNumberString, IsPositive, IsUUID } from 'class-validator'

@ArgsType()
@InputType()
export class CaptureCardAcquisitionPayinAdminRequest {
  @Field()
  @IsUUID()
  readonly employeeId: string

  @Field()
  @IsNumberString()
  readonly transactionExternalPaymentId: string

  @Field()
  @IsPositive()
  @IsNumber()
  readonly amount: number
}
