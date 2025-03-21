import { ArgsType, Field, InputType } from '@nestjs/graphql'
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

@ArgsType()
@InputType()
export class RequestPhysicalCardRequest {
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

  @Field(() => String)
  @IsString()
  readonly city!: string

  @Field(() => String)
  @IsAlphanumeric()
  readonly postalCode!: string

  @Field(() => String)
  @IsString()
  readonly street!: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly additionnalAddress?: string
}
