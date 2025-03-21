import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ApiAdresseResponse {
  @Field(() => String, { nullable: true })
  label?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => String, { nullable: true })
  postalCode?: string

  @Field(() => String, { nullable: true })
  country?: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => Float, { nullable: true })
  latitude?: number

  @Field(() => Float, { nullable: true })
  longitude?: number
}
