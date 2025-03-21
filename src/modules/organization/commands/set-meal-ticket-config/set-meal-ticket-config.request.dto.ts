import { ArgsType, Field, Float, InputType, Int } from '@nestjs/graphql'
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator'

@ArgsType()
@InputType()
export class SetMealTicketConfigRequest {
  @Field(() => Float, {
    nullable: true,
    description:
      'Coverage percent must be between legal values. Percent must be between 0 and 100',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  readonly coveragePercent?: number

  @Field(() => Float, {
    nullable: true,
    description: 'meal ticket must be below legal limit and above 0',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly mealTicketAmount?: number

  @Field(() => Int, {
    nullable: true,
    description: 'must be between 0 and 28 so that we have one every month',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly mealTicketDay?: number

  @Field(() => Boolean, {
    nullable: true,
    description:
      'Does the admin want meal ticket to be renewed automatically (1 year max)',
  })
  @IsOptional()
  @IsBoolean()
  readonly mealTicketAutoRenew?: boolean

  @Field(() => Float, {
    nullable: true,
    description:
      'How much the organization pay for his employees physical card price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly physicalCardCoverage?: number

  @Field(() => Float, {
    nullable: true,
    description:
      'How much the organization pay for his first employees physical card price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly firstPhysicalCardCoverage?: number
}
