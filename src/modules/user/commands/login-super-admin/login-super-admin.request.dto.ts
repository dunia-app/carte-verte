import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class LoginSuperAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsString()
  readonly password!: string
}
