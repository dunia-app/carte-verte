import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  AdvantageForm,
  PointOfSaleType,
  advantageFormEnumName,
  pointOfSaleTypeEnumName,
} from '../../domain/entities/merchant.types'
import { MerchantCategoryOrmEntity } from '../merchant-category/merchant-category.orm-entity'
import { MerchantLabelOrmEntity } from '../merchant-label/merchant-label.orm-entity'

@Entity('merchant')
@Index('IDX_merchant_mid', ['mid'])
@Index('IDX_merchant_labelName', ['labelName'])
export class MerchantOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantOrmEntity) {
    super(props)
  }
  @Column({ type: 'varchar', nullable: true })
  mid?: string

  @Column('varchar')
  name!: string

  @ManyToOne(() => MerchantCategoryOrmEntity)
  merchantCategory?: MerchantCategoryOrmEntity

  @Column('uuid', { nullable: true })
  merchantCategoryId?: string

  @Column({
    nullable: true,
    type: 'enum',
    enum: AdvantageForm,
    enumName: advantageFormEnumName,
  })
  advantageForm?: AdvantageForm

  @Column({
    nullable: true,
    type: 'enum',
    enum: PointOfSaleType,
    enumName: pointOfSaleTypeEnumName,
  })
  pointOfSaleType?: PointOfSaleType

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  attribute?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  // Address
  @Column({ type: 'varchar', nullable: true })
  city?: string

  @Column({ type: 'varchar', nullable: true })
  postalCode?: string

  @Column({ type: 'varchar', nullable: true })
  street?: string

  @Column({ type: 'varchar', nullable: true })
  country?: string

  @Column({ nullable: true, type: 'float' })
  longitude?: number

  @Column({ nullable: true, type: 'float' })
  latitude?: number
  ///

  @Column({ type: 'varchar', nullable: true })
  email?: string

  @Column({ type: 'varchar', nullable: true })
  website?: string

  // Merchant grades
  @Column({ default: 0, type: 'float' })
  bio!: number

  @Column({ default: 0, type: 'float' })
  local!: number

  @Column({ default: 0, type: 'float' })
  vegetarian!: number

  @Column({ default: 0, type: 'float' })
  antiwaste!: number

  @Column({ default: 0, type: 'float' })
  nowaste!: number

  @Column({ default: 0, type: 'float' })
  inclusive!: number

  @Column({ default: 0, type: 'float' })
  total!: number
  ///

  @Column({
    array: true,
    type: 'text',
    default: [],
  })
  imageLinks!: string[]

  // null means do not take into account
  // empty means not cities where it is available
  // '*' means available everywhere
  @Column({
    array: true,
    type: 'text',
    nullable: true,
  })
  deliveryCities?: string[]

  @Column({
    type: 'text',
    nullable: true,
  })
  reviewLink?: string

  @ManyToOne(() => MerchantLabelOrmEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'labelName', referencedColumnName: 'name' })
  merchantLabel?: MerchantLabelOrmEntity

  @Column({ type: 'varchar', nullable: true })
  labelName?: string

  @Column({ type: 'boolean', default: false })
  isHidden!: boolean

  @Column({ nullable: true, type: 'timestamptz' })
  isCashbackableSince?: Date

  @Column({ type: 'boolean', default: false })
  isBlacklisted!: boolean
}
