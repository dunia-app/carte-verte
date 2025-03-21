import { ArgsType, Field, Float, ID, InputType, Int } from '@nestjs/graphql'
import {
  IsAlphanumeric,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  Min,
} from 'class-validator'
import {
  AdvantageForm,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'

@ArgsType()
@InputType()
export class UpsertMerchantRequest {
  @Field(() => ID, {
    nullable: true,
    description:
      'internal merchantId, provide if you want to update an existing record, if not provided it will be an insert',
  })
  @IsOptional()
  @IsUUID()
  readonly merchantId?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly mid?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsNumberString()
  @Length(1, 4)
  readonly mcc?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(14)
  readonly siret?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(AdvantageForm)
  readonly advantageForm?: AdvantageForm

  @Field(() => PointOfSaleType, { nullable: true })
  @IsOptional()
  @IsEnum(PointOfSaleType)
  readonly pointOfSaleType?: PointOfSaleType

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly description?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsPhoneNumber('FR')
  readonly phone?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly city?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsAlphanumeric()
  readonly postalCode?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly street?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  readonly email?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  readonly website?: string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly bio?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly local?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly vegetarian?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly antiwaste?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly nowaste?: number

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly inclusive?: number

  @Field(() => [String], { defaultValue: [], nullable: true })
  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  readonly imageLinks!: string[]

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly deliveryCities?: string[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly attribute?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  readonly labelName?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  readonly reviewLink?: string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  readonly isHidden?: boolean

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  readonly isBlacklisted?: boolean

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly filterCodes?: string[]
}
