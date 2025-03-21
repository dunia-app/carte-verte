import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  TemplateEntity,
  TemplateProps,
} from '../../domain/entities/template.entity'
import { TemplateOrmEntity } from './template.orm-entity'

export class TemplateOrmMapper extends OrmMapper<
  TemplateEntity,
  TemplateOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: TemplateEntity,
  ): OrmEntityProps<TemplateOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<TemplateOrmEntity> = {
      templateName: props.templateName,
      allowedNotificationType: props.allowedNotificationType,
      title: props.title,
      content: props.content,
      iconUrl: props.iconUrl,
      link: props.link,
      unsubscribable: props.unsubscribable,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: TemplateOrmEntity,
  ): EntityProps<TemplateProps> {
    const id = new UUID(ormEntity.id)
    const props: TemplateProps = {
      templateName: ormEntity.templateName,
      allowedNotificationType: ormEntity.allowedNotificationType,
      title: ormEntity.title ? ormEntity.title : undefined,
      content: ormEntity.content,
      iconUrl: ormEntity.iconUrl ? ormEntity.iconUrl : undefined,
      link: ormEntity.link ? ormEntity.link : undefined,
      unsubscribable: ormEntity.unsubscribable,
    }
    return { id, props }
  }
}
