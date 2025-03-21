import { Field, ObjectType } from '@nestjs/graphql'
import { BaseEntityProps } from '../../domain/base-classes/entity.base'
import { IdResponse } from '../dtos/id.response.dto'

@ObjectType({ isAbstract: true })
export class ResponseBase extends IdResponse {
  constructor(entity: BaseEntityProps) {
    super(entity.id.value)
    this.createdAt = entity.createdAt.value.toISOString()
    this.updatedAt = entity.updatedAt.value.toISOString()
  }

  @Field(() => String, { description: "020-11-24T17:43:15.970Z'" })
  createdAt: string

  @Field(() => String, { description: "020-11-24T17:43:15.970Z'" })
  updatedAt: string
}
