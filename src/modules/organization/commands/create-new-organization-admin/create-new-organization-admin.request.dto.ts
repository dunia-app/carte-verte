import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsNumber, IsString, Max, Min } from 'class-validator'
import { CommissionType } from '../../domain/value-objects/organization-offer.value-object'

@ArgsType()
@InputType()
export class CreateNewOrganizationAdminRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => String)
  @IsString()
  readonly firstname!: string

  @Field(() => String)
  @IsString()
  readonly lastname!: string

  @Field(() => String)
  @IsString()
  readonly organizationName!: string

  @Field(() => Float)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly commission!: number

  @Field(() => CommissionType)
  @IsEnum(CommissionType)
  commissionType!: CommissionType

  @Field(() => Float)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly advantageInShops!: number

  @Field(() => Float)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly physicalCardPrice!: number

  @Field(() => Float)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly firstPhysicalCardPrice!: number

  @Field(() => Float, { nullable: true })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly physicalCardCoverage!: number

  @Field(() => Float, { nullable: true })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  @Max(100)
  readonly firstPhysicalCardCoverage!: number
}
