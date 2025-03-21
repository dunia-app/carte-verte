import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNumberString, IsString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class SetOrganizationAdminPasswordRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'token that has been sent at user creation by email' })
  @IsNumberString()
  readonly token!: string

  @Field(() => String, { description: 'password, choosen by the user to login' })
  @IsString()
  @Length(8)
  readonly password!: string
}
