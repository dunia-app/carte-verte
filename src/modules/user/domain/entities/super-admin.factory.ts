import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { SuperAdminOrmEntity } from '../../database/super-admin/super-admin.orm-entity'
import { SuperAdminRepository } from '../../database/super-admin/super-admin.repository'
import { SuperAdminEntity, SuperAdminProps } from './super-admin.entity'

interface SuperAdminFactoryProps {
  userId: UUID
}

export class SuperAdminFactory extends BaseFactory<
  SuperAdminEntity,
  SuperAdminFactoryProps,
  SuperAdminRepository,
  SuperAdminOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(SuperAdminRepository)
  }

  protected buildEntity(defaultData: SuperAdminFactoryProps) {
    const props: SuperAdminProps = {
      password: faker.internet.password({ length: 8}),
      ...defaultData,
    }
    return new SuperAdminEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
