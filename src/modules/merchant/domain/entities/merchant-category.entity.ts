import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MCC } from '../value-objects/mcc.value-object'

export interface CreateMerchantCategoryProps {
  mcc: MCC
  name?: string
  description?: string
  iconUrl?: string
}

export interface MerchantCategoryProps extends CreateMerchantCategoryProps {
  defaultImageLinks: string[]
  carbonFootprint?: number
}

export class MerchantCategoryEntity extends AggregateRoot<MerchantCategoryProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateMerchantCategoryProps): MerchantCategoryEntity {
    const id = UUID.generate()
    const props: MerchantCategoryProps = {
      defaultImageLinks: [],
      ...create,
    }
    const merchantCategory = new MerchantCategoryEntity({ id, props })

    return merchantCategory
  }

  get mcc(): MCC {
    return this.props.mcc
  }

  public validate(): void {}
}
