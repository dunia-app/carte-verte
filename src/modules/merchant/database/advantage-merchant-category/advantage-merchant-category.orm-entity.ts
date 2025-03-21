import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { AdvantageOrmEntity } from '../advantage/advantage.orm-entity'

@Entity('advantage_merchant_category')
@Unique('UQ_advantage_merchant_category', ['advantageId', 'merchantCategoryId'])
export class AdvantageMerchantCategoryOrmEntity extends TypeormEntityBase {
  constructor(props?: AdvantageMerchantCategoryOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  advantageId!: string

  @Column({ type: 'boolean', default: true })
  isBlackList!: boolean

  @Column('uuid')
  merchantCategoryId!: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => AdvantageOrmEntity, (advantage) => advantage.id, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'advantageId' })
  private _advantage!: never
}
