import { isPublicHoliday } from '../../../../helpers/public_holiday.helper'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantagePeriod, AdvantageType } from './advantage.types'

export interface CreateAdvantageProps {
  name: string
  description: string
  type: AdvantageType
  index: number
  legalLimit: number
  limitPeriod: AdvantagePeriod
  workingDaysOnly: boolean
}

export interface AdvantageProps extends CreateAdvantageProps {}

export class AdvantageEntity extends AggregateRoot<AdvantageProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateAdvantageProps): AdvantageEntity {
    const id = UUID.generate()
    const props: AdvantageProps = {
      ...create,
    }
    const advantage = new AdvantageEntity({ id, props })
    return advantage
  }

  get type(): AdvantageType {
    return this.props.type
  }

  get name(): string {
    return this.props.name
  }

  get legalLimit(): number {
    return this.props.legalLimit
  }

  get limitPeriod(): AdvantagePeriod {
    return this.props.limitPeriod
  }

  public isDateAllowed(date: Date, isSundayWorker: boolean): boolean {
    // sunday = 0, workingDays != 0
    return (
      isSundayWorker ||
      !this.props.workingDaysOnly ||
      (date.getDay() != 0 && !isPublicHoliday(date))
    )
  }

  public validate(): void {}
}
