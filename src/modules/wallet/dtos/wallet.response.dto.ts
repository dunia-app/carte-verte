import { Field, Float, ObjectType } from '@nestjs/graphql'
import { toScale } from '../../../helpers/math.helper'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import {
  AdvantagePeriod,
  AdvantageType,
  noKycMonthlyLimit,
} from '../../merchant/domain/entities/advantage.types'
import { WalletEntity } from '../domain/entities/wallet.entity'
import { Limit } from '../domain/value-objects/limit.value-object'

@ObjectType()
export class SubWalletResponse extends ResponseBase {
  constructor(wallet: WalletEntity, limit?: Limit) {
    super(wallet)
    const props = wallet.getPropsCopy()
    this.balance = toScale(props.balance.value)
    this.authorizedBalance = toScale(props.authorizedBalance.value)
    this.advantage = props.advantage
    this.DAILY = limit?.DAILY
    this.MONTHLY = limit?.MONTHLY
    this.YEARLY = limit?.YEARLY
  }
  @Field(() => Float)
  balance: number

  @Field(() => Float)
  authorizedBalance: number

  @Field(() => AdvantageType)
  advantage: AdvantageType;

  @Field(() => Float, { nullable: true })
  [AdvantagePeriod.DAILY]?: number;

  @Field(() => Float, { nullable: true })
  [AdvantagePeriod.MONTHLY]?: number;

  @Field(() => Float, { nullable: true })
  [AdvantagePeriod.YEARLY]?: number
}

@ObjectType()
export class WalletResponse {
  constructor(
    wallets: WalletEntity[],
    limitPerAdvantage: Map<AdvantageType, Limit>,
  ) {
    this.totalBalance = 0
    this.totalDAILY = 0
    this.totalMONTHLY = 0
    this.totalYEARLY = 0
    this.subWallets = []
    wallets.map((wallet) => {
      const props = wallet.getPropsCopy()
      const limit = limitPerAdvantage.get(props.advantage)
      this.subWallets.push(new SubWalletResponse(wallet, limit))
      // For now we remove the limit for none advantage
      // To be deleted when we allow user to do overdraft with their none wallet
      if (
        wallet.advantage !== AdvantageType.NONE &&
        wallet.advantage !== AdvantageType.EXTERNAL
      ) {
        this.totalDAILY += limit?.DAILY ? limit.DAILY : 0
        this.totalMONTHLY += limit?.MONTHLY ? limit.MONTHLY : 0
        this.totalYEARLY += limit?.YEARLY ? limit.YEARLY : 0
      }
      if (wallet.advantage !== AdvantageType.EXTERNAL) {
        this.totalBalance += props.authorizedBalance.value
      }
    })
    this.totalBalance = toScale(this.totalBalance)
    // For now we max limit by Baas card limit
    this.totalDAILY = toScale(
      Math.min(this.totalBalance, this.totalDAILY, noKycMonthlyLimit),
    )
    this.totalMONTHLY = toScale(
      Math.min(this.totalBalance, this.totalMONTHLY, noKycMonthlyLimit),
    )
    this.totalYEARLY = toScale(
      Math.min(this.totalBalance, this.totalYEARLY, noKycMonthlyLimit),
    )
  }
  @Field(() => Float)
  totalBalance: number

  @Field(() => Float)
  totalDAILY: number

  @Field(() => Float)
  totalMONTHLY: number

  @Field(() => Float)
  totalYEARLY: number

  @Field(() => [SubWalletResponse])
  subWallets: SubWalletResponse[]
}
