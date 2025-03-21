import { countPublicHolidayInMonthByDay } from '../../../../helpers/public_holiday.helper'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { WeekDay } from '../../../../libs/ddd/domain/value-objects/weekday.types'

export type BooleanByWeekdayProps = {
  [key in WeekDay]: boolean
}

export class BooleanByWeekday extends ValueObject<BooleanByWeekdayProps> {
  get [WeekDay.MONDAY](): boolean {
    return this.props.MONDAY
  }
  get [WeekDay.TUESDAY](): boolean {
    return this.props.TUESDAY
  }
  get [WeekDay.WEDNESDAY](): boolean {
    return this.props.WEDNESDAY
  }
  get [WeekDay.THURSDAY](): boolean {
    return this.props.THURSDAY
  }
  get [WeekDay.FRIDAY](): boolean {
    return this.props.FRIDAY
  }
  get [WeekDay.SATURDAY](): boolean {
    return this.props.SATURDAY
  }
  get [WeekDay.SUNDAY](): boolean {
    return this.props.SUNDAY
  }

  countDaysOfWork(date: Date): number {
    return countWorkedDaysInMonth(date, this.props)
  }

  protected validate(props: BooleanByWeekdayProps): void {}
}

export const booleanByWeekdayDefault = new BooleanByWeekday({
  MONDAY: true,
  TUESDAY: true,
  WEDNESDAY: true,
  THURSDAY: true,
  FRIDAY: true,
  SATURDAY: false,
  SUNDAY: false,
})

function countWorkedDaysInMonth(
  date: Date,
  booleanByWeekday: BooleanByWeekdayProps,
) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]
  const count = Array(7).fill(4)
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate()
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const startDay = firstDayOfMonth.getDay()

  const inc = daysInMonth - 28

  // Find days that are occurring 5 times in the month
  for (let i = startDay; i < startDay + inc; i++) {
    const dayIndex = i % 7
    count[dayIndex] = 5
  }

  const publicHolidayInMonth = countPublicHolidayInMonthByDay(
    date.getFullYear(),
    date.getMonth() + 1,
  )

  // Subtract public holidays from the count array
  for (let i = 0; i < 7; i++) {
    count[i] -= publicHolidayInMonth[i]
    // Ensure the count is not negative
    count[i] = Math.max(count[i], 0)
  }

  let result = 0
  for (let i = 0; i < 7; i++) {
    if (booleanByWeekday[days[i].toUpperCase() as WeekDay]) {
      result += count[i]
    }
  }

  return result
}
