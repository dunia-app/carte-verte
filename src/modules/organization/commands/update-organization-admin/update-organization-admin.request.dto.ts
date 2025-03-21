import { ArgsType, Field, ID, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateOrganizationAdminRequest {
  @Field(() => ID)
  @IsUUID()
  readonly organizationAdminId!: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly firstname?: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  readonly lastname?: string

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  readonly email?: string
}
