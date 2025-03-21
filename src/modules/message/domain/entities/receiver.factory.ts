import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ReceiverOrmEntity } from '../../database/receiver/receiver.orm-entity'
import { ReceiverRepository } from '../../database/receiver/receiver.repository'
import { ReceiverEntity, ReceiverProps } from './receiver.entity'

export interface ReceiverFactoryProps {
  userId: UUID
  email?: Email
  acceptEmail?: boolean
  acceptNotification?: boolean
}

export class ReceiverFactory extends BaseFactory<
  ReceiverEntity,
  ReceiverFactoryProps,
  ReceiverRepository,
  ReceiverOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(ReceiverRepository)
  }

  protected buildEntity(defaultData: ReceiverFactoryProps) {
    const props: ReceiverProps = {
      email: new Email(faker.internet.email()),
      deviceTokens: [],
      acceptEmail: false,
      acceptNotification: false,
      ...defaultData,
    }
    return new ReceiverEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
