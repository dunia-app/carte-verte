import { registerEnumType } from '@nestjs/graphql'

export enum AdvantageType {
  MEALTICKET = 'MEALTICKET',
  CULTURALCHEQUE = 'CULTURALCHEQUE',
  MOBILITYFORFAIT = 'MOBILITYFORFAIT',
  GIFTCARD = 'GIFTCARD',
  NONE = 'NONE',
  EXTERNAL = 'EXTERNAL',
}
export const advantageTypeEnumName = 'advantage_type_enum'
registerEnumType(AdvantageType, {
  name: 'advantageTypeEnumName',
})

export enum AdvantagePeriod {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
export const advantagePeriodEnumName = 'advantage_period_enum'

export function getAdvantageIndex(advantage: AdvantageType) {
  switch (advantage) {
    case AdvantageType.MEALTICKET:
      return 0
    case AdvantageType.CULTURALCHEQUE:
      return 1
    case AdvantageType.MOBILITYFORFAIT:
      return 2
    case AdvantageType.GIFTCARD:
      return 3
    case AdvantageType.NONE:
      return 4
    case AdvantageType.EXTERNAL:
      return 5
  }
}

// For the moment we only handle MealTickets so we match the super limit with it
// But once we have other advantage we'll need to remove this
export const transactionSuperLimit = 25

export const noKycMonthlyLimit = 200
