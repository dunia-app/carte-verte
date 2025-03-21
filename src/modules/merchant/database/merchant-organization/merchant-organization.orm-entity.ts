import { Column, Entity, Index, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('merchant_organization')
@Unique('UQ_merchant_organization_cntr_registration_number_siret', [
  'siret',
  'cntrRegistrationNumber',
])
@Unique('UQ_merchant_organization_siret', ['siret'])
@Index('IDX_merchant_organization_siret', ['siret'])
@Index('IDX_merchant_organization_naf', ['naf'])
export class MerchantOrganizationOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantOrganizationOrmEntity) {
    super(props)
  }
  @Column('varchar')
  siret!: string

  @Column({ nullable: true, type: 'text' })
  cntrRegistrationNumber?: string | null

  @Column('varchar')
  naf!: string

  @Column('varchar')
  brandName!: string

  @Column('varchar')
  organizationName!: string

  @Column({ type: 'varchar', nullable: true })
  city!: string

  @Column({ type: 'varchar', nullable: true })
  postalCode!: string

  @Column({ type: 'varchar', nullable: true })
  street?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'varchar', nullable: true })
  email?: string

  @Column({ nullable: true, type: 'date' })
  registrationClosedAt?: Date

  @Column({ nullable: true, type: 'date' })
  registrationStartedAt?: Date

  @Column({ nullable: true, type: 'date' })
  organizationCreatedAt?: Date

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({ type: 'varchar', nullable: true })
  website?: string

  @Column({ type: 'smallint', default: 0 })
  affiliationInvitationSent!: number

  @Column({ nullable: true, type: 'timestamp' })
  emailBouncedOn?: Date

  @Column({
    array: true,
    type: 'text',
    default: [],
    // Update: false to avoid updating column everything
    // update: false,
  })
  imageLinks!: string[]

  @Column({ type: 'timestamp', nullable: true })
  unactivatedAt?: Date
}
