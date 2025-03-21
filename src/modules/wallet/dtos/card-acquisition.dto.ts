import { Field, Float, ObjectType } from '@nestjs/graphql'
import { noKycMonthlyLimit } from '../../merchant/domain/entities/advantage.types'
import { CardAcquisitionEntity } from '../domain/entities/card-acquisition.entity'

@ObjectType()
export class CardAcquisitionResponse {
  constructor(cardAcquisition: CardAcquisitionEntity) {
    this.amount = noKycMonthlyLimit
    this.maskedPan = cardAcquisition.maskedPan
  }
  @Field(() => Float, { nullable: true })
  amount?: number

  @Field(() => String)
  maskedPan: string

  @Field(() => String)
  status: string
}

@ObjectType()
export class RequestCardAcquisitionLinkResponse {
  constructor(url: string, orderId: string) {
    this.url = url
    this.orderId = orderId
  }
  @Field(() => String)
  url: string

  @Field(() => String)
  orderId: string
}
