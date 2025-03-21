import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsOptional } from 'class-validator'
import { CardDesign } from '../../domain/entities/card.types'

@ArgsType()
@InputType()
export class CreateVirtualCardAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field({ nullable: true, defaultValue: CardDesign.GREEN })
  @IsEnum(CardDesign)
  @IsOptional()
  readonly design!: CardDesign
}
