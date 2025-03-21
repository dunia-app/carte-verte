import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  OrganizationDefautWalletSettingsEntity,
  OrganizationDefautWalletSettingsProps,
} from '../../domain/entities/organization-defaut-wallet-settings.entity'
import { AdvantageList } from '../../domain/value-objects/advantage-list.value-object'
import { OrganizationDefautWalletSettingsOrmEntity } from './organization-defaut-wallet-settings.orm-entity'

export class OrganizationDefautWalletSettingsOrmMapper extends OrmMapper<
  OrganizationDefautWalletSettingsEntity,
  OrganizationDefautWalletSettingsOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: OrganizationDefautWalletSettingsEntity,
  ): OrmEntityProps<OrganizationDefautWalletSettingsOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<OrganizationDefautWalletSettingsOrmEntity> =
      {
        organizationId: props.organizationId.value,
        name: props.name,
        advantageList: props.advantageList.unpack(),
      }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: OrganizationDefautWalletSettingsOrmEntity,
  ): EntityProps<OrganizationDefautWalletSettingsProps> {
    const id = new UUID(ormEntity.id)
    const props: OrganizationDefautWalletSettingsProps = {
      organizationId: new UUID(ormEntity.organizationId),
      name: ormEntity.name,
      advantageList: new AdvantageList(ormEntity.advantageList),
    }
    return { id, props }
  }
}
