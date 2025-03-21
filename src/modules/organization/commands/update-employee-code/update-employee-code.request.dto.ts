import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsNumberString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateEmployeeCodeRequest {
  @Field(() => String, { description: 'current code, choosen by the user at login' })
  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  readonly currentCode!: string

  @Field(() => String, {
    description: 'new code, choosen by the user to replace the current one',
  })
  @IsNumberString()
  @Length(4, 4)
  readonly newCode!: string
}
