import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsString } from 'class-validator'

@ArgsType()
@InputType()
export class UpdateOrganizationAdminPasswordRequest {
  @Field(() => String)
  @IsString()
  readonly currentPassword!: string

  @Field(() => String)
  @IsString()
  readonly newPassword!: string
}
