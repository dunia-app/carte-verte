import { ArgsType, Field, InputType } from '@nestjs/graphql'
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

@ArgsType()
@InputType()
export class LoginEmployeeRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'code, choosen by the user to login' })
  @IsNumberString()
  @Length(4, 4)
  readonly code!: string

  // TO DO: nullable is to be deprecated and deviceId will be mandatory
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly deviceId?: string
}
