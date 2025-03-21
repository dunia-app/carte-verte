import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsNumberString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class ValidateEmployeeSmsTokenRequest {
  @Field(() => String, {
    description: 'Token received as an answer from askEmployeeSmsToken',
  })
  @IsNumberString()
  readonly mobileToken!: string

  @Field(() => String, { description: 'Code received by sms' })
  @IsNumberString()
  @Length(6, 6)
  readonly mobileCode!: string
}
