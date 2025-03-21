import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { AdvantagePeriod } from '../../../merchant/domain/entities/advantage.types'

export type LimitProps = {
  [key in AdvantagePeriod]?: number
}

export class Limit extends ValueObject<LimitProps> {
  get [AdvantagePeriod.DAILY](): number | undefined {
    return this.props.DAILY
  }

  get [AdvantagePeriod.MONTHLY](): number | undefined {
    return this.props.MONTHLY
  }

  get [AdvantagePeriod.YEARLY](): number | undefined {
    return this.props.YEARLY
  }

  protected validate(props: LimitProps): void {
    Object.values(AdvantagePeriod).forEach((type) => {
      const period = props[type]
      if (!isUndefined(period) && period < 0) {
        throw new ArgumentOutOfRangeException(
          `${type} limit amount cannot be less than zero`,
        )
      }
    })
  }
}
