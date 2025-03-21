import { ArgsType, Field, ID, InputType } from '@nestjs/graphql'
import { IsString, IsUUID } from 'class-validator'

@ArgsType()
@InputType()
export class FindPointOfSaleRequest {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  readonly pointOfSaleId!: string
}
