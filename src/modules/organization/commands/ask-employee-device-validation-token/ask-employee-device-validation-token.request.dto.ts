import { ArgsType, Field, InputType, registerEnumType } from '@nestjs/graphql'
import { IsEmail, IsEnum, IsString } from 'class-validator'

export enum DeviceValidationMethod {
  SMS = 'SMS',
}
export const deviceValidationMethodEnumName = 'device_validation_method_enum'
registerEnumType(DeviceValidationMethod, {
  name: deviceValidationMethodEnumName,
})

@ArgsType()
@InputType()
export class AskEmployeeDeviceValidationTokenRequest {
  @Field(() => String)
  @IsEmail()
  readonly email!: string

  @Field(() => DeviceValidationMethod)
  @IsEnum(DeviceValidationMethod)
  readonly method!: DeviceValidationMethod

  @Field(() => String)
  @IsString()
  readonly deviceId!: string
}
