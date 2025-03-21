import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsNumber, Max, Min } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateCardAcquisitionOverdraftRequest {
  @Field(() => Float, { description: 'The amount to authorize, max 200' })
  @IsNumber()
  @Min(1)
  @Max(200)
  readonly authorizedOverdraft!: number
}
