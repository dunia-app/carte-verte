import { ArgsType, Field, Float, InputType } from '@nestjs/graphql'
import { IsNumber, IsString, IsUUID, Max, Min } from 'class-validator'
import { noKycMonthlyLimit } from '../../../merchant/domain/entities/advantage.types'
import { ValidateCardAcquisitionRequest } from './validate-card-acquisition.request.dto'

@ArgsType()
@InputType()
export class ValidateCardAcquisitionAdminRequest extends ValidateCardAcquisitionRequest {
  @Field(() => String)
  @IsString()
  @IsUUID()
  readonly employeeId!: string

  @Field(() => String)
  @IsString()
  readonly externalEmployeeId!: string

  @Field(() => Float, {
    description: `The amount to authorize, max ${noKycMonthlyLimit}. Nullable if replacing an existing`,
    nullable: true,
  })
  @IsNumber()
  @Min(1)
  @Max(noKycMonthlyLimit)
  readonly authorizedOverdraft!: number
}
