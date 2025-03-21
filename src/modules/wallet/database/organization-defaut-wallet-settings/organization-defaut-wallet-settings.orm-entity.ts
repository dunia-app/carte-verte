import { Column, Entity } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('organization_wallet')
export class OrganizationDefautWalletSettingsOrmEntity extends TypeormEntityBase {
  constructor(props?: OrganizationDefautWalletSettingsOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column({ unique: true, type: 'uuid' })
  organizationId!: string

  @Column('varchar')
  name!: string

  @Column('jsonb')
  advantageList: any
}
