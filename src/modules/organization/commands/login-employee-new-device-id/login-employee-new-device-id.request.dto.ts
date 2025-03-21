import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNumberString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class LoginEmployeeNewDeviceIdRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'code, choosen by the user to login' })
  @IsNumberString()
  @Length(4, 4)
  readonly code!: string

  @Field(() => String, {
    description: 'Token received as an answer from askEmployeeDeviceId',
  })
  @IsNumberString()
  readonly token!: string

  @Field(() => String, { description: 'Code received by the user' })
  @IsNumberString()
  @Length(6, 10)
  readonly validationCode!: string
}
