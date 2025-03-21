import { Field, ObjectType } from '@nestjs/graphql'
import { capitalize } from '../../../helpers/string.helper'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import { UserEntity } from '../domain/entities/user.entity'

@ObjectType()
export class UserResponse extends ResponseBase {
  constructor(user: UserEntity) {
    super(user)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    const props = user.getPropsCopy()
    this.firstname = capitalize(props.name.firstname)
  }

  @Field(() => String, {
    description: "User's firstname",
  })
  firstname: string
}
