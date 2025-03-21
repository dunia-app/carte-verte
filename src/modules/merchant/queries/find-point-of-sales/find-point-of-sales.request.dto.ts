import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { CursorPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import {
  AdvantageForm,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'

@ArgsType()
@InputType()
export class FindPointOfSalesRequest {
  @Field(() => CursorPaginationBase)
  @ValidateNested()
  @Type(() => CursorPaginationBase)
  readonly pagination!: CursorPaginationBase

  @Field(() => String, {
    nullable: true,
    description:
      'address from which to calculate the distance, by default it will be the organization address',
  })
  @IsOptional()
  @IsString()
  readonly address?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly latitude?: number

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  readonly longitude?: number

  @Field(() => [AdvantageForm], {
    nullable: true,
    defaultValue: [AdvantageForm.CASHBACK],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AdvantageForm, { each: true })
  readonly advantageForm!: AdvantageForm[]

  @Field(() => [PointOfSaleType], {
    nullable: true,
    defaultValue: [PointOfSaleType.DELIVERY, PointOfSaleType.PHYSICAL],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PointOfSaleType, { each: true })
  readonly pointOfSaleType!: PointOfSaleType[]

  @Field(() => Float, {
    nullable: true,
    description: 'Radius in km from the address point',
  })
  @IsOptional()
  @IsNumber()
  readonly radius?: number
}
