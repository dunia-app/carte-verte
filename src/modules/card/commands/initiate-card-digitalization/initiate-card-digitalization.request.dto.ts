import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { XPayProvider } from '../../domain/entities/card.types'

@ArgsType()
@InputType()
export class InitiateCardDigitalizationRequest {
  @Field(() => XPayProvider)
  @IsEnum(XPayProvider)
  readonly xPayProvider!: XPayProvider

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  readonly certificates?: string[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly nonce?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly nonceSignature?: string
}
