import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'

export type AdvantageListProps = {
  [key in AdvantageType]: boolean
}

export class AdvantageList extends ValueObject<AdvantageListProps> {
  get [AdvantageType.MEALTICKET](): boolean {
    return this.props.MEALTICKET
  }

  get [AdvantageType.CULTURALCHEQUE](): boolean {
    return this.props.CULTURALCHEQUE
  }

  get [AdvantageType.MOBILITYFORFAIT](): boolean {
    return this.props.MOBILITYFORFAIT
  }

  get [AdvantageType.GIFTCARD](): boolean {
    return this.props.GIFTCARD
  }

  get [AdvantageType.NONE](): boolean {
    return this.props.NONE
  }

  get activatedAdvantages(): AdvantageType[] {
    return Object.entries(this.props)
      .filter(([_key, value]) => value)
      .map(([key, _value]) => {
        return Object.entries(AdvantageType).find(
          ([advantage, _val]) => key === advantage,
        )![1]
      })
  }

  protected validate(props: AdvantageListProps): void {}
}
