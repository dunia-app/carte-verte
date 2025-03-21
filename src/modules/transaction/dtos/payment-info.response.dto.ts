import { Field, ObjectType } from '@nestjs/graphql'

export interface PaymentInfoResponseProps {
  iban: string
  name: string
}

@ObjectType()
export class PaymentInfoResponse {
  constructor(props: PaymentInfoResponseProps) {
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.name = props.name
    this.iban = props.iban
  }

  @Field(() => String)
  name: string

  @Field(() => String)
  iban: string
}
