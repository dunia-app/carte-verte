import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { UserOrmEntity } from '../../../user/database/user/user.orm-entity'
import { RefreshTokenProps } from '../../domain/value-objects/refresh-token.value-object'
import { OrganizationOrmEntity } from '../organization/organization.orm-entity'

@Entity('organization_admin')
export class OrganizationAdminOrmEntity extends TypeormEntityBase {
  constructor(props?: OrganizationAdminOrmEntity) {
    super(props)
  }
  // TODO: still property to fill (isNullable, etc)
  @Column('uuid')
  userId!: string

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt?: Date

  @Column({ type: 'varchar', nullable: true })
  password?: string

  @Column({ type: 'jsonb', default: () => "'[]'" })
  refreshTokens!: RefreshTokenProps[]

  @Column({ type: 'smallint', default: 0 })
  passwordFailedAttemps!: number

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => UserOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  private _user!: never

  @ManyToMany(() => OrganizationOrmEntity)
  @JoinTable({
    name: 'organization_admins_organizations',
    joinColumn: {
      name: 'adminId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'organizationId',
      referencedColumnName: 'id',
    },
  })
  public organizations!: OrganizationOrmEntity[]
}
