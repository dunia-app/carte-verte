import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantMerchantOrganizationCreatedDomainEvent } from '../events/merchant-merchant-organization-created.domain-event'

export interface CreateMerchantMerchantOrganizationProps {
  mid: string
  merchantName: string
  siret: string
}

export interface MerchantMerchantOrganizationProps
  extends CreateMerchantMerchantOrganizationProps {}

export class MerchantMerchantOrganizationEntity extends AggregateRoot<MerchantMerchantOrganizationProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateMerchantMerchantOrganizationProps,
  ): MerchantMerchantOrganizationEntity {
    const id = UUID.generate()
    const props: MerchantMerchantOrganizationProps = {
      ...create,
    }
    const merchantMerchantOrganization = new MerchantMerchantOrganizationEntity(
      { id, props },
    )

    merchantMerchantOrganization.addEvent(
      new MerchantMerchantOrganizationCreatedDomainEvent({
        aggregateId: id.value,
        mid: props.mid,
      }),
    )
    return merchantMerchantOrganization
  }

  get mid(): string {
    return this.props.mid
  }

  get merchantName(): string {
    return this.props.merchantName
  }

  get siret(): string {
    return this.props.siret
  }

  set mid(mid: string) {
    this.props.mid = mid
  }

  set siret(siret: string) {
    this.props.siret = siret
  }

  public validate(): void {}
}
