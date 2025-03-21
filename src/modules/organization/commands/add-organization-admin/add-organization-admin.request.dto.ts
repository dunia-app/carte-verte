import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsOptional, IsString } from 'class-validator'
import { IsValidDate } from '../../../../libs/decorators/is-valid-date.decorator'

@ArgsType()
@InputType()
export class AddOrganizationAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsString()
  readonly firstname!: string

  @Field(() => String)
  @IsString()
  readonly lastname!: string

  // To delete
  @Field(() => Date, { nullable: true })
  @IsValidDate()
  @IsOptional()
  readonly birthday?: Date
}
