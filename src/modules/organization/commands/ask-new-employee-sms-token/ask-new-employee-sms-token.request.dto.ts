import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator'

@ArgsType()
@InputType()
export class AskNewEmployeeSmsTokenRequest {
  @Field(() => String, { description: 'used to check if user exists' })
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsPhoneNumber('FR')
  readonly mobile!: string

  // TO DO: nullable is to be deprecated and deviceToken will be mandatory
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly deviceId?: string
}
