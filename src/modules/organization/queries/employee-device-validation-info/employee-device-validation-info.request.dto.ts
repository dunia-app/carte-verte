import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty } from 'class-validator'

@ArgsType()
@InputType()
export class EmployeeDeviceValidationInfoRequest {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  readonly email!: string
}
