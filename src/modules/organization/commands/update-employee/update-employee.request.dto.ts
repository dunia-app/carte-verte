import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateEmployeeRequest {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly firstname?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly lastname?: string
}
