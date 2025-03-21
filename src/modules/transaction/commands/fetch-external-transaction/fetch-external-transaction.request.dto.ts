import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsDate, IsOptional, IsString } from 'class-validator'

@ArgsType()
@InputType()
export class FetchExternalTransactionRequest {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  readonly from?: Date

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  readonly to?: Date

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly externalPaymentId?: string
}
