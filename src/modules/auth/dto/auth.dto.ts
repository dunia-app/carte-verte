import { Field, ObjectType } from '@nestjs/graphql'
import { UserRoles } from '../../user/domain/entities/user.types'

@ObjectType()
export class JwtPayload {
  @Field(() => String)
  id!: string

  @Field(() => UserRoles)
  role!: UserRoles

  @Field(() => String, { nullable: true })
  deviceId?: string

  @Field(() => String, { nullable: true})
  email?: string
}

@ObjectType()
export class AuthResp {
  @Field(() => String)
  jwt!: string

  @Field(() => String)
  refreshToken!: string
}
