import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrmEntityProps } from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { MerchantCategoryOrmEntity } from '../merchant-category/merchant-category.orm-entity'

@Entity('merchant_category_naf')
@Unique('UQ_merchant_category_naf_naf', ['naf'])
@Index('IDX_merchant_category_naf_naf', ['naf'])
export class MerchantCategoryNafOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<MerchantCategoryNafOrmEntity>) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  @ManyToOne(() => MerchantCategoryOrmEntity)
  @JoinColumn({ name: 'mcc', referencedColumnName: 'mcc' })
  merchantCategory?: MerchantCategoryOrmEntity

  @Column('varchar')
  mcc!: string

  @Column('varchar')
  naf!: string
}
