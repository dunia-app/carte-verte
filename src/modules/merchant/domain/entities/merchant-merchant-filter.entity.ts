import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

export interface CreateMerchantMerchantFilterProps {
  code: string
  mid: string
}

export interface MerchantMerchantFilterProps
  extends CreateMerchantMerchantFilterProps {}

export class MerchantMerchantFilterEntity extends AggregateRoot<MerchantMerchantFilterProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateMerchantMerchantFilterProps,
  ): MerchantMerchantFilterEntity {
    const id = UUID.generate()
    const props: MerchantMerchantFilterProps = {
      ...create,
    }
    const merchantMerchantFilter = new MerchantMerchantFilterEntity({
      id,
      props,
    })

    return merchantMerchantFilter
  }

  public validate(): void {}
}
