import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsString } from 'class-validator'

@ArgsType()
@InputType()
export class CreateOrganizationAdminDevRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsString()
  readonly firstname!: string

  @Field(() => String)
  @IsString()
  readonly lastname!: string
}
