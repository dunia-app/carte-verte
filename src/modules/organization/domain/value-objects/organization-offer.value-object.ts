import { registerEnumType } from '@nestjs/graphql'
import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'
import { ArgumentOutOfRangeException } from '../../../../libs/exceptions/index'

export enum CommissionType {
  PERCENT = 'PERCENT',
  PER_EMPLOYEE_PER_MONTH = 'PER_EMPLOYEE_PER_MONTH',
}
export const commissionTypeEnumName = 'commission_type_enum'

registerEnumType(CommissionType, { name: commissionTypeEnumName })

export interface OrganizationOfferProps {
  commission: number
  commissionType: CommissionType
  advantageInShops: number
  physicalCardPrice: number
  firstPhysicalCardPrice: number
}

export class OrganizationOffer extends ValueObject<OrganizationOfferProps> {
  get commission(): number {
    return this.props.commission
  }
  get commissionType(): CommissionType {
    return this.props.commissionType
  }
  get advantageInShops(): number {
    return this.props.advantageInShops
  }
  get physicalCardPrice(): number {
    return this.props.physicalCardPrice
  }
  get firstPhysicalCardPrice(): number {
    return this.props.firstPhysicalCardPrice
  }

  protected validate(props: OrganizationOfferProps): void {
    if (
      props.commissionType === CommissionType.PERCENT &&
      props.commission > 100
    ) {
      throw new ArgumentOutOfRangeException(
        'commission is a percentage, it must be between 0 and 100',
      )
    }
    if (props.commission < 0) {
      throw new ArgumentOutOfRangeException('commission must be positive')
    }
    if (props.advantageInShops < 0 || props.advantageInShops > 100) {
      throw new ArgumentOutOfRangeException(
        'advantageInShops is a percentage, it must be between 0 and 100',
      )
    }
    if (props.physicalCardPrice < 0) {
      throw new ArgumentOutOfRangeException(
        'physicalCardPrice cannot be negative',
      )
    }
    if (props.firstPhysicalCardPrice < 0) {
      throw new ArgumentOutOfRangeException(
        'firstPhysicalCardPrice cannot be negative',
      )
    }
  }
}
