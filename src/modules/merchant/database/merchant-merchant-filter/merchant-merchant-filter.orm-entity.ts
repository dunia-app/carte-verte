import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { MerchantFilterOrmEntity } from '../merchant-filter/merchant-filter.orm-entity'

@Entity('merchant_merchant_filter')
@Index('IDX_merchant_merchant_filter_code', ['code'])
@Index('IDX_merchant_merchant_filter_mid', ['mid'])
@Unique('UQ_merchant_merchant_filter_code_mid', ['code', 'mid'])
export class MerchantMerchantFilterOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantMerchantFilterOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar')
  code!: string

  @Column('varchar')
  mid!: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => MerchantFilterOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'code', referencedColumnName: 'code' })
  private _merchant_filter!: never
}
