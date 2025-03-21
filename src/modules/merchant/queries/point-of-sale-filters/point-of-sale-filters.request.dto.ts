import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEnum, IsOptional } from 'class-validator'
import { AdvantageType } from '../../domain/entities/advantage.types'

@ArgsType()
@InputType()
export class PointOfSaleFiltersRequest {
  @Field(() => AdvantageType, { nullable: true })
  @IsOptional()
  @IsEnum(AdvantageType)
  readonly advantage?: AdvantageType
}
