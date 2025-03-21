import { toScale } from '../../../../helpers/math.helper'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  OrganizationCoveragePercentIsIncorrectError,
  OrganizationMealTicketAmountIsIncorrectError,
  OrganizationMealTicketDayIsIncorrectError,
  OrganizationPhysicalCardCoverageIsNegativeError,
} from '../../errors/organization.errors'

const minOrganizationCoveragePercent = 50
const maxOrganizationCoveragePercent = 60
const maxOrganizationCoverageAmount = Number(
  process.env.MAX_ORGANIZATION_COVERAGE_AMOUNT!,
)

export interface OrganizationSettingsProps {
  coveragePercent?: number
  mealTicketAmount?: number
  mealTicketDay?: number
  mealTicketAutoRenew: boolean
  physicalCardCoverage: number
  firstPhysicalCardCoverage: number
}

export class OrganizationSettings extends ValueObject<OrganizationSettingsProps> {
  get coveragePercent(): number | undefined {
    return this.props.coveragePercent
      ? Number(this.props.coveragePercent)
      : undefined
  }
  get mealTicketAmount(): number | undefined {
    return this.props.mealTicketAmount
      ? Number(this.props.mealTicketAmount)
      : undefined
  }
  get mealTicketDay(): number | undefined {
    return this.props.mealTicketDay
      ? Number(this.props.mealTicketDay)
      : undefined
  }
  get mealTicketAutoRenew(): boolean {
    return this.props.mealTicketAutoRenew
  }
  get physicalCardCoverage(): number {
    return this.props.physicalCardCoverage
  }
  get firstPhysicalCardCoverage(): number {
    return this.props.firstPhysicalCardCoverage
  }

  get isComplete(): boolean {
    return (
      !isUndefined(this.coveragePercent) &&
      !isUndefined(this.mealTicketAmount) &&
      !isUndefined(this.mealTicketDay)
    )
  }

  protected validate(props: OrganizationSettingsProps): void {
    if (!isUndefined(props.coveragePercent)) {
      if (
        props.coveragePercent < minOrganizationCoveragePercent ||
        props.coveragePercent > maxOrganizationCoveragePercent
      ) {
        throw new OrganizationCoveragePercentIsIncorrectError(
          `organizationCoveragePercent is not between authorized value. Percent must be between 0 and 100 and coveragePercent, by law must be between ${minOrganizationCoveragePercent} and ${maxOrganizationCoveragePercent}`,
        )
      }
      const maxMealTicketAmount = toScale(
        (maxOrganizationCoverageAmount * 100) / props.coveragePercent,
        2,
      )

      if (
        !isUndefined(props.mealTicketAmount) &&
        props.mealTicketAmount > maxMealTicketAmount
      ) {
        throw new OrganizationMealTicketAmountIsIncorrectError(
          `mealTicketAmount is more than authorized value. Current legal limit : ${maxMealTicketAmount}`,
        )
      }
    }

    if (
      !isUndefined(props.mealTicketDay) &&
      (props.mealTicketDay < 1 || props.mealTicketDay > 28)
    ) {
      throw new OrganizationMealTicketDayIsIncorrectError(
        'mealTicketDay must be between 1 and 28 to happen every month',
      )
    }

    if (
      !isUndefined(props.physicalCardCoverage) &&
      props.physicalCardCoverage < 0
    ) {
      throw new OrganizationPhysicalCardCoverageIsNegativeError(
        `physicalCardCoverage is less than zero`,
      )
    }

    if (
      !isUndefined(props.firstPhysicalCardCoverage) &&
      props.firstPhysicalCardCoverage < 0
    ) {
      throw new OrganizationPhysicalCardCoverageIsNegativeError(
        `firstPhysicalCardCoverage is less than zero`,
      )
    }
  }
}
