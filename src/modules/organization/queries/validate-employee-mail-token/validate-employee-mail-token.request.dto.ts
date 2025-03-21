import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNumberString } from 'class-validator'

@ArgsType()
@InputType()
export class ValidateEmployeeMailTokenRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'token that has been  received by mail' })
  @IsNumberString()
  readonly token!: string
}
