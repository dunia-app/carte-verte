import { Column, Entity, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('merchant_category')
@Unique('UQ_merchant_category_mcc', ['mcc'])
export class MerchantCategoryOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantCategoryOrmEntity) {
    super(props)
  }
  @Column('varchar')
  mcc!: string

  @Column({ type: 'varchar', nullable: true })
  name?: string

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  iconUrl?: string

  @Column({
    array: true,
    type: 'text',
    default: [],
  })
  defaultImageLinks!: string[]

  @Column({ nullable: true, type: 'decimal' })
  carbonFootprint?: number
}
