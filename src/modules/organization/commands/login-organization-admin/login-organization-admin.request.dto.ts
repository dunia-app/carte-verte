import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class LoginOrganizationAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'password, choosen by the user to login' })
  @IsString()
  @Length(8)
  readonly password!: string
}
