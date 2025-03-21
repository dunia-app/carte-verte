import { ArgsType, Field, ID, InputType } from '@nestjs/graphql'
import { IsUUID } from 'class-validator'

@ArgsType()
@InputType()
export class DistributeCashbackAdminRequest {
  @Field(() => ID)
  @IsUUID()
  readonly transactionId!: string
}
