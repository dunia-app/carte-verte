import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator'

@InputType()
export class AddressRequest {
  @Field(() => String)
  @IsString()
  readonly street!: string

  @Field(() => String)
  @IsString()
  readonly city!: string

  @Field(() => String)
  @IsString()
  readonly postalCode!: string
}

@ArgsType()
@InputType()
export class RegisterOrganizationAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'token that has been sent at user creation by email' })
  @IsNumberString()
  readonly token!: string

  @Field(() => String, { description: 'password, choosen by the user to login' })
  @IsString()
  @Length(8)
  readonly password!: string

  @Field(() => String)
  @IsNumberString()
  @Length(14)
  readonly siret!: string

  @Field(() => String, {
    nullable: true,
    description:
      'optional name of the organization if siret is not validated by the api',
  })
  @IsOptional()
  name?: string

  @Field(() => AddressRequest, {
    nullable: true,
    description:
      'optional address of the organization if siret is not validated by the api',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressRequest)
  address?: AddressRequest
}
