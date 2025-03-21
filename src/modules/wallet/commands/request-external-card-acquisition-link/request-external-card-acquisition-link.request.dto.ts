import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsNumber, IsOptional, Max, Min } from 'class-validator'
import { noKycMonthlyLimit } from '../../../merchant/domain/entities/advantage.types'

@ArgsType()
@InputType()
export class RequestExternalCardAcquisitionLinkRequest {
  @Field(() => Float, {
    description: `The amount to authorize, max ${noKycMonthlyLimit}. Nullable if replacing an existing`,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(noKycMonthlyLimit)
  readonly authorizedOverdraft?: number
}
