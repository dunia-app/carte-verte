import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator'
import { CardDesign } from '../../../card/domain/entities/card.types'

@ArgsType()
@InputType()
export class SetEmployeeAccountAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsPhoneNumber('FR')
  readonly mobile!: string

  @Field({ nullable: true, defaultValue: CardDesign.GREEN })
  @IsEnum(CardDesign)
  @IsOptional()
  readonly design!: CardDesign
}
