import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantageType } from './advantage.types'

export interface CreateMerchantFilterProps {
  code: string
  name: string
  parentCode: AdvantageType
}

export interface MerchantFilterProps extends CreateMerchantFilterProps {}

export class MerchantFilterEntity extends AggregateRoot<MerchantFilterProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateMerchantFilterProps): MerchantFilterEntity {
    const id = UUID.generate()
    const props: MerchantFilterProps = {
      ...create,
    }
    const merchantFilter = new MerchantFilterEntity({ id, props })

    return merchantFilter
  }

  get code(): string {
    return this.props.code
  }

  get name(): string {
    return this.props.name
  }

  static getOtherFilter(advantage: AdvantageType): MerchantFilterEntity {
    return MerchantFilterEntity.create({
      name: `Autres`,
      code: `${advantage}_OTHER`,
      parentCode: advantage,
    })
  }

  public validate(): void {}
}
