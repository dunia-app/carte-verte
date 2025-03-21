import { Field, ObjectType } from '@nestjs/graphql'
import { Id } from '../interfaces/id.interface'

@ObjectType({ isAbstract: true })
export class IdResponse implements Id {
  constructor(id: string) {
    this.id = id
  }

  @Field(() => String)
  id: string
}
