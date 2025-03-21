import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsOptional } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateCardOptionsAdminRequest {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  readonly nfc?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  readonly foreign?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  readonly online?: boolean
}
