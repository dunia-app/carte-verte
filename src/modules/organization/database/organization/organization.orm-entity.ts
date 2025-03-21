import { Column, Entity, ManyToMany } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  CommissionType,
  commissionTypeEnumName,
} from '../../domain/value-objects/organization-offer.value-object'
import { OrganizationAdminOrmEntity } from '../organization-admin/organization-admin.orm-entity'

@Entity('organization')
export class OrganizationOrmEntity extends TypeormEntityBase {
  constructor(props?: OrganizationOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar')
  name!: string

  // Address
  @Column({ type: 'varchar', nullable: true })
  city?: string

  @Column({ type: 'varchar', nullable: true })
  postalCode?: string

  @Column({ type: 'varchar', nullable: true })
  street?: string

  @Column({ nullable: true, type: 'float' })
  longitude?: number

  @Column({ nullable: true, type: 'float' })
  latitude?: number
  ///

  @Column({ type: 'varchar', nullable: true })
  siret?: string

  @Column('boolean')
  hasAcceptedOffer!: boolean

  // Organization offer
  @Column({ type: 'decimal' })
  commission!: number

  @Column({
    default: CommissionType.PERCENT,
    type: 'enum',
    enum: CommissionType,
    enumName: commissionTypeEnumName,
  })
  commissionType!: CommissionType

  @Column({ type: 'decimal' })
  advantageInShops!: number

  @Column({ type: 'decimal' })
  physicalCardPrice!: number

  @Column({ type: 'decimal' })
  firstPhysicalCardPrice!: number
  ///

  // OrganizationSettings
  @Column({ type: 'decimal', nullable: true })
  coveragePercent?: number

  @Column({ type: 'decimal', nullable: true })
  mealTicketAmount?: number

  @Column({ type: 'smallint', nullable: true })
  mealTicketDay?: number

  @Column({ type: 'boolean', default: false, nullable: true })
  mealTicketAutoRenew?: boolean

  @Column({ default: 0, type: 'decimal', nullable: true })
  physicalCardCoverage?: number

  @Column({ default: 0, type: 'decimal', nullable: true })
  firstPhysicalCardCoverage?: number
  ///

  @Column({ type: 'varchar', nullable: true })
  iban?: string

  @Column({ type: 'varchar', nullable: true })
  bankLabel?: string

  @Column({ type: 'varchar', nullable: true })
  commonName?: string

  @ManyToMany(() => OrganizationAdminOrmEntity)
  private _admins!: never
}
