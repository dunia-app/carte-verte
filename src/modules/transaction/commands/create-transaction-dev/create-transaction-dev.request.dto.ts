import { ArgsType, Field, Float, InputType, Int } from '@nestjs/graphql'
import { IsBoolean, IsEmail, IsNumber, IsOptional } from 'class-validator'

@ArgsType()
@InputType()
export class CreateTransactionDevRequest {
  @Field(() => Int, { description: 'Max 25' })
  @IsNumber()
  readonly numberToCreate!: number

  @Field(() => Boolean, {
    description: 'create transactions for today ?',
    nullable: true,
    defaultValue: false,
  })
  @IsBoolean()
  readonly today!: boolean

  @Field(() => Float, {
    description: 'Amount you want for of each transaction',
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  readonly amount?: number

  @Field()
  @IsEmail()
  readonly email!: string
}
