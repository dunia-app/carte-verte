import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationAdminOrmEntity } from '../../database/organization-admin/organization-admin.orm-entity'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { OrganizationAdminPassword } from '../value-objects/organization-admin-password.value-object'
import {
  OrganizationAdminEntity,
  OrganizationAdminProps,
} from './organization-admin.entity'

export interface OrganizationAdminFactoryProps {
  organizationId: UUID
  userId: UUID
  activatedAt?: DateVO
  password?: OrganizationAdminPassword
}

export class OrganizationAdminFactory extends BaseFactory<
  OrganizationAdminEntity,
  OrganizationAdminFactoryProps,
  OrganizationAdminRepository,
  OrganizationAdminOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(OrganizationAdminRepository)
  }

  protected buildEntity(defaultData: OrganizationAdminFactoryProps) {
    const props: OrganizationAdminProps = {
      refreshTokens: [],
      organizationsIds: [defaultData.organizationId],
      passwordFailedAttemps: 0,
      ...defaultData,
    }
    return new OrganizationAdminEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
