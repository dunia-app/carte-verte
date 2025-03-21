import { Column, Entity } from 'typeorm'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrmEntityProps } from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('organization_admins_organizations')
export class OrganizationAdminsOrganizationsOrmEntity extends TypeormEntityBase {
  constructor(
    props?: OrmEntityProps<OrganizationAdminsOrganizationsOrmEntity>,
  ) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  @Column('uuid')
  adminId!: string

  @Column('uuid')
  organizationId!: string
}
