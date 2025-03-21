import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsNumberString, Length } from 'class-validator'

@ArgsType()
@InputType()
export class ResetPinRequest {
  @Field(() => String)
  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  readonly newPin!: string

  @Field(() => String)
  @IsNotEmpty()
  @IsNumberString()
  @Length(4, 4)
  readonly confirmPin!: string
}
