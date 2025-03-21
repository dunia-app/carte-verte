import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsEmail, IsNumber, IsPositive } from 'class-validator'

@ArgsType()
@InputType()
export class CreditWalletDevRequest {
  @Field(() => String)
  @IsEmail()
  readonly employeeEmail!: string

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  readonly amount!: number
}
