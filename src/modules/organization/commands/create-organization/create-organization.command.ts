import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CommissionType } from '../../domain/value-objects/organization-offer.value-object'
import { OrganizationAlreadyExistsError } from '../../errors/organization.errors'

// Command is a plain object with properties
export class CreateOrganizationCommand extends Command<
  UUID,
  OrganizationAlreadyExistsError
> {
  constructor(props: CommandProps<CreateOrganizationCommand>) {
    super(props)
    this.name = props.name
    this.commission = props.commission
    this.commissionType = props.commissionType
    this.advantageInShops = props.advantageInShops
    this.physicalCardPrice = props.physicalCardPrice
    this.firstPhysicalCardPrice = props.firstPhysicalCardPrice
    this.organizationCoveragePercent = props.organizationCoveragePercent
    this.mealTicketAmount = props.mealTicketAmount
  }

  readonly name: string

  readonly commission: number

  readonly commissionType: CommissionType

  readonly advantageInShops: number

  readonly physicalCardPrice: number
  readonly firstPhysicalCardPrice: number

  readonly organizationCoveragePercent: number

  readonly mealTicketAmount: number
}
