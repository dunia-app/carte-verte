import { Column, Entity, Index, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('merchant_label')
@Unique('UQ_merchant_label_name', ['name'])
@Index('IDX_merchant_label_name', ['name'])
export class MerchantLabelOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantLabelOrmEntity) {
    super(props)
  }
  @Column('varchar')
  name!: string

  @Column({
    type : 'varchar',
    nullable: true,
  })
  link?: string

  @Column({
    nullable: true,
    type: 'text',
  })
  imageLink?: string
}
