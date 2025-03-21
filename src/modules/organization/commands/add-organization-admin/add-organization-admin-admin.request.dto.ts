import { ArgsType, Field, ID, InputType } from '@nestjs/graphql'
import { IsEmail, IsString, IsUUID } from 'class-validator'

@ArgsType()
@InputType()
export class AddOrganizationAdminAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsString()
  readonly firstname!: string

  @Field(() => String)
  @IsString()
  readonly lastname!: string

  @Field(() => ID)
  @IsUUID()
  readonly organizationId!: string
}
