import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  OrganizationCoveragePercentIsIncorrectError,
  OrganizationMealTicketAmountIsIncorrectError,
  OrganizationMealTicketDayIsIncorrectError,
} from '../../errors/organization.errors'

// Command is a plain object with properties
export class SetMealTicketConfigCommand extends Command<
  string,
  | OrganizationMealTicketAmountIsIncorrectError
  | OrganizationCoveragePercentIsIncorrectError
  | OrganizationMealTicketDayIsIncorrectError
> {
  constructor(props: CommandProps<SetMealTicketConfigCommand>) {
    super(props)
    this.organizationId = props.organizationId
    this.coveragePercent = props.coveragePercent
    this.mealTicketAmount = props.mealTicketAmount
    this.mealTicketDay = props.mealTicketDay
    this.mealTicketAutoRenew = props.mealTicketAutoRenew
    this.physicalCardCoverage = props.physicalCardCoverage
    this.firstPhysicalCardCoverage = props.firstPhysicalCardCoverage
  }

  readonly organizationId: string

  readonly coveragePercent?: number

  readonly mealTicketAmount?: number

  readonly mealTicketDay?: number

  readonly mealTicketAutoRenew?: boolean

  readonly physicalCardCoverage?: number

  readonly firstPhysicalCardCoverage?: number
}
