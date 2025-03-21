import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@ArgsType()
@InputType()
export class LogoutEmployeeRequest {
  @Field(() => String)
  @IsString()
  readonly deviceToken!: string

  @Field(() => String)
  @IsString()
  readonly refreshToken!: string
}
