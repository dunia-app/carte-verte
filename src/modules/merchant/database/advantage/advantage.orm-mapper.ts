import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  AdvantageEntity,
  AdvantageProps,
} from '../../domain/entities/advantage.entity'
import { AdvantageOrmEntity } from './advantage.orm-entity'

export class AdvantageOrmMapper extends OrmMapper<
  AdvantageEntity,
  AdvantageOrmEntity
> {
  protected encryptedFields = [] as const

  protected toOrmProps(
    entity: AdvantageEntity,
  ): OrmEntityProps<AdvantageOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<AdvantageOrmEntity> = {
      name: props.name,
      description: props.description,
      type: props.type,
      index: props.index,
      legalLimit: props.legalLimit,
      limitPeriod: props.limitPeriod,
      workingDaysOnly: props.workingDaysOnly,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: AdvantageOrmEntity,
  ): EntityProps<AdvantageProps> {
    const id = new UUID(ormEntity.id)
    const props: AdvantageProps = {
      name: ormEntity.name,
      description: ormEntity.description,
      type: ormEntity.type,
      index: ormEntity.index,
      legalLimit: Number(ormEntity.legalLimit),
      limitPeriod: ormEntity.limitPeriod,
      workingDaysOnly: ormEntity.workingDaysOnly,
    }
    return { id, props }
  }
}
