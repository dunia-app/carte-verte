import { DateVO } from '../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { WebhookEntity, WebhookProps } from '../entity/webhook.entity'
import { WebhookSource } from '../entity/webhook.types'
import { WebhookOrmEntity } from './webhook.orm-entity'

export class WebhookOrmMapper extends OrmMapper<
  WebhookEntity<any>,
  WebhookOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: WebhookEntity<any>,
  ): OrmEntityProps<WebhookOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<WebhookOrmEntity> = {
      source: props.source.toString(),
      externalId: props.externalId,
      externalCreatedAt: props.externalCreatedAt,
      event: props.event,
      handledAt: props.handledAt?.value,
      handlerResponse: props.handlerResponse,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: WebhookOrmEntity,
  ): EntityProps<WebhookProps<any>> {
    const id = new UUID(ormEntity.id)
    const props: WebhookProps<any> = {
      source: Object.values(WebhookSource).find(
        (source) => source === ormEntity.source,
      )!,
      externalId: ormEntity.externalId,
      externalCreatedAt: ormEntity.externalCreatedAt,
      event: ormEntity.event,
      handledAt: ormEntity.handledAt
        ? new DateVO(ormEntity.handledAt)
        : undefined,
      handlerResponse: ormEntity.handlerResponse
        ? ormEntity.handlerResponse
        : undefined,
    }
    return { id, props }
  }
}
