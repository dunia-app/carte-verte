import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsBoolean } from 'class-validator'

@ArgsType()
@InputType()
export class AcceptNotificationRequest {
  @Field(() => Boolean)
  @IsBoolean()
  readonly acceptNotification!: boolean
}
