import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

export interface CreateAdvantageMerchantCategoryProps {
  advantageId: UUID
  merchantCategoryId: UUID
  isBlackList: boolean
}

export interface AdvantageMerchantCategoryProps
  extends CreateAdvantageMerchantCategoryProps {}

export class AdvantageMerchantCategoryEntity extends AggregateRoot<AdvantageMerchantCategoryProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateAdvantageMerchantCategoryProps,
  ): AdvantageMerchantCategoryEntity {
    const id = UUID.generate()
    const props: AdvantageMerchantCategoryProps = {
      ...create,
    }
    const advantageMerchant = new AdvantageMerchantCategoryEntity({ id, props })

    return advantageMerchant
  }

  get isBlackList(): boolean {
    return this.props.isBlackList
  }

  public validate(): void {}
}
