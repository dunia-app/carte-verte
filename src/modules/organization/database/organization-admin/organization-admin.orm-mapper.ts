import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  OrganizationAdminEntity,
  OrganizationAdminProps,
} from '../../domain/entities/organization-admin.entity'
import { OrganizationAdminPassword } from '../../domain/value-objects/organization-admin-password.value-object'
import { RefreshToken } from '../../domain/value-objects/refresh-token.value-object'
import { OrganizationOrmEntity } from '../organization/organization.orm-entity'
import { OrganizationAdminOrmEntity } from './organization-admin.orm-entity'

export class OrganizationAdminOrmMapper extends OrmMapper<
  OrganizationAdminEntity,
  OrganizationAdminOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: OrganizationAdminEntity,
  ): OrmEntityProps<OrganizationAdminOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<OrganizationAdminOrmEntity> = {
      userId: props.userId.value,
      activatedAt: props.activatedAt?.value,
      password: props.password?.value,
      refreshTokens: props.refreshTokens
        .filter((it) => it.isNotExpired)
        .map((it) => it.unpack()),
      passwordFailedAttemps: props.passwordFailedAttemps,
      organizations: props.organizationsIds.map((id) => {
        const orgEntity = new OrganizationOrmEntity()
        orgEntity.id = id.value
        return orgEntity
      }),
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: OrganizationAdminOrmEntity,
  ): EntityProps<OrganizationAdminProps> {
    const id = new UUID(ormEntity.id)
    const props: OrganizationAdminProps = {
      userId: new UUID(ormEntity.userId),
      activatedAt: ormEntity.activatedAt
        ? new DateVO(ormEntity.activatedAt)
        : undefined,
      password: ormEntity.password
        ? new OrganizationAdminPassword(ormEntity.password)
        : undefined,
      refreshTokens: ormEntity.refreshTokens.map(
        (it) =>
          new RefreshToken({
            token: it.token,
            expiresIn: new Date(it.expiresIn),
          }),
      ),
      passwordFailedAttemps: ormEntity.passwordFailedAttemps,
      organizationsIds: ormEntity?.organizations?.map((it) => new UUID(it.id)),
    }
    return { id, props }
  }
}
