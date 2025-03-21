import { toScale } from '../../../../helpers/math.helper'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'

export type TransactionAdvantageRepartitionProps = {
  [key in AdvantageType]?: number
}

export class TransactionAdvantageRepartition extends ValueObject<TransactionAdvantageRepartitionProps> {
  get [AdvantageType.MEALTICKET](): number | undefined {
    return this.props.MEALTICKET ? toScale(this.props.MEALTICKET, 2) : undefined
  }

  set [AdvantageType.MEALTICKET](value: number | undefined) {
    this.props.MEALTICKET = value ? toScale(value, 2) : value
  }

  get [AdvantageType.CULTURALCHEQUE](): number | undefined {
    return this.props.CULTURALCHEQUE
      ? toScale(this.props.CULTURALCHEQUE, 2)
      : undefined
  }

  set [AdvantageType.CULTURALCHEQUE](value: number | undefined) {
    this.props.CULTURALCHEQUE = value ? toScale(value, 2) : value
  }

  get [AdvantageType.MOBILITYFORFAIT](): number | undefined {
    return this.props.MOBILITYFORFAIT
      ? toScale(this.props.MOBILITYFORFAIT, 2)
      : undefined
  }

  set [AdvantageType.MOBILITYFORFAIT](value: number | undefined) {
    this.props.MOBILITYFORFAIT = value ? toScale(value, 2) : value
  }

  get [AdvantageType.GIFTCARD](): number | undefined {
    return this.props.GIFTCARD ? toScale(this.props.GIFTCARD, 2) : undefined
  }

  set [AdvantageType.GIFTCARD](value: number | undefined) {
    this.props.GIFTCARD = value ? toScale(value, 2) : value
  }

  get [AdvantageType.NONE](): number | undefined {
    return this.props.NONE ? toScale(this.props.NONE, 2) : undefined
  }

  set [AdvantageType.NONE](value: number | undefined) {
    this.props.NONE = value ? toScale(value, 2) : value
  }

  get [AdvantageType.EXTERNAL](): number | undefined {
    return this.props.EXTERNAL ? toScale(this.props.EXTERNAL, 2) : undefined
  }

  set [AdvantageType.EXTERNAL](value: number | undefined) {
    this.props.NONE = value ? toScale(value, 2) : value
  }

  // Everything is cashbackable
  cashbackableAmount(): number {
    return (
      (this.props.MEALTICKET ? this.props.MEALTICKET : 0) +
      (this.props.CULTURALCHEQUE ? this.props.CULTURALCHEQUE : 0) +
      (this.props.MOBILITYFORFAIT ? this.props.MOBILITYFORFAIT : 0) +
      (this.props.GIFTCARD ? this.props.GIFTCARD : 0) +
      (this.props.NONE ? this.props.NONE : 0) +
      (this.props.EXTERNAL ? this.props.EXTERNAL : 0)
    )
  }

  static getProps(
    repart: TransactionAdvantageRepartition,
  ): TransactionAdvantageRepartitionProps {
    return repart.props
  }

  static isRepartitionCorrect(
    total: number,
    repart: TransactionAdvantageRepartition,
  ): boolean {
    return (
      toScale(
        Object.entries(repart.props).reduce((a, [_key, value]) => {
          return Number(a) + Number(value)
        }, 0),
        2,
      ) === total
    )
  }

  protected validate(props: TransactionAdvantageRepartitionProps): void {}
}
