import { Field, ObjectType } from '@nestjs/graphql'

export interface PointOfSaleFilterResponseProps {
  name: string
  code: string
}

@ObjectType()
export class PointOfSaleFilterResponse {
  constructor(props: PointOfSaleFilterResponseProps) {
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.name = props.name
    this.code = props.code
  }

  @Field(() => String, { nullable: true })
  name: string

  @Field(() => String, { nullable: true })
  code: string
}
