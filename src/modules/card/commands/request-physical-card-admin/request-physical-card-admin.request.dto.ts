import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsEmail } from 'class-validator'
import { RequestPhysicalCardRequest } from '../request-physical-card/request-physical-card.request.dto'

@ArgsType()
@InputType()
export class RequestPhysicalCardAdminRequest extends RequestPhysicalCardRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string
}
