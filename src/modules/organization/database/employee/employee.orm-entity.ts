import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { UserOrmEntity } from '../../../user/database/user/user.orm-entity'
import { BooleanByWeekdayProps } from '../../domain/value-objects/boolean-by-weekday.value-object'
import { RefreshTokenProps } from '../../domain/value-objects/refresh-token.value-object'
import { OrganizationOrmEntity } from '../organization/organization.orm-entity'

@Entity('employee')
export class EmployeeOrmEntity extends TypeormEntityBase {
  constructor(props?: EmployeeOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  organizationId!: string

  @Column('uuid')
  userId!: string

  @Column({ type: 'varchar', nullable: true })
  externalEmployeeId?: string

  @Column({ nullable: true, type: 'timestamptz' })
  activatedAt?: Date

  @Column({ type: 'varchar', nullable: true })
  code?: string

  @Column({ type: 'jsonb', default: () => "'[]'" })
  refreshTokens!: RefreshTokenProps[]

  @Column({ nullable: true, type: 'jsonb' })
  mealTicketDays!: BooleanByWeekdayProps

  @Column({ nullable: true, type: 'timestamptz' })
  cguAcceptedAt?: Date

  @Column({ type: 'smallint', default: 0 })
  codeFailedAttemps!: number

  @Column({ nullable: true, type: 'timestamptz' })
  willBeDeletedAt?: Date | null

  @Column({ nullable: true, type: 'timestamptz' })
  freezedAt?: Date | null

  @Column({ type: 'date' })
  birthday!: string

  @Column({ type: 'float' })
  defaultAuthorizedOverdraft: number

  @Column({ type: 'text', array: true, default: [] })
  deviceIds!: string[]

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => OrganizationOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  private _organization!: never

  @ManyToOne(() => UserOrmEntity, (u: UserOrmEntity) => u.id, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  private _user!: never
}
