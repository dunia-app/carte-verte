import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  jwtToken!: string

  @Field(() => String)
  refreshToken!: string
}
