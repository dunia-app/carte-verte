import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NameNotValideError } from '../../../../libs/ddd/domain/value-objects/name.error'
import { OrganizationEntity } from '../../domain/entities/organization.entity'
import { CommissionType } from '../../domain/value-objects/organization-offer.value-object'

// Command is a plain object with properties
export class CreateNewOrganizationAdminCommand extends Command<
  OrganizationEntity,
  NameNotValideError
> {
  constructor(props: CommandProps<CreateNewOrganizationAdminCommand>) {
    super(props)
    this.email = props.email
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.organizationName = props.organizationName
    this.commission = props.commission
    this.commissionType = props.commissionType
    this.advantageInShops = props.advantageInShops
    this.physicalCardPrice = props.physicalCardPrice
    this.firstPhysicalCardPrice = props.firstPhysicalCardPrice
    this.physicalCardCoverage = props.physicalCardCoverage
    this.firstPhysicalCardCoverage = props.firstPhysicalCardCoverage
  }

  readonly email: string
  readonly firstname: string
  readonly lastname: string
  readonly organizationName: string
  readonly commission: number
  readonly commissionType: CommissionType
  readonly advantageInShops: number
  readonly physicalCardPrice: number
  readonly firstPhysicalCardPrice: number
  readonly physicalCardCoverage?: number
  readonly firstPhysicalCardCoverage?: number
}
