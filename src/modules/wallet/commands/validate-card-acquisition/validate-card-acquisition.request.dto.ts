import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@ArgsType()
@InputType()
export class ValidateCardAcquisitionRequest {
  @Field(() => String)
  @IsString()
  readonly orderId!: string
}
