import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { CardEntity, CardProps } from '../../domain/entities/card.entity'
import { CardDigitalization } from '../../domain/value-objects/card-digitalization.value-object'
import { CardOrmEntity } from './card.orm-entity'

export class CardOrmMapper extends OrmMapper<CardEntity, CardOrmEntity> {
  protected encryptedFields = [] as const
  protected toOrmProps(entity: CardEntity): OrmEntityProps<CardOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<CardOrmEntity> = {
      employeeId: props.employeeId.value,
      externalId: props.externalId,
      publicToken: props.publicToken,
      lockStatus: props.lockStatus,
      activatedAt: props.activatedAt?.value,
      requestedToConvertToPhysicalAt: props.requestedToConvertToPhysicalAt
        ? props.requestedToConvertToPhysicalAt.value
        : null,
      convertedToPhysicalAt: props.convertedToPhysicalAt?.value,
      physicalCardPriceToCover: props.physicalCardPriceToCover,
      physicalCardCoveredAt: props.physicalCardCoveredAt?.value,
      blockedAt: props.blockedAt?.value,
      isPinSet: props.isPinSet,
      cardDigitalizations: props.cardDigitalizations.map((cardDigitalization) =>
        cardDigitalization.unpack(),
      ),
      embossedName: props.embossedName,
      suffix: props.suffix,
      pinTryExceeded: props.pinTryExceeded,
      design: props.design,
    }
    return ormProps
  }

  protected toDomainProps(ormEntity: CardOrmEntity): EntityProps<CardProps> {
    const id = new UUID(ormEntity.id)
    const props: CardProps = {
      employeeId: new UUID(ormEntity.employeeId),
      externalId: ormEntity.externalId,
      publicToken: ormEntity.publicToken,
      lockStatus: ormEntity.lockStatus,
      activatedAt: ormEntity.activatedAt
        ? new DateVO(ormEntity.activatedAt)
        : undefined,
      requestedToConvertToPhysicalAt: ormEntity.requestedToConvertToPhysicalAt
        ? new DateVO(ormEntity.requestedToConvertToPhysicalAt)
        : undefined,
      convertedToPhysicalAt: ormEntity.convertedToPhysicalAt
        ? new DateVO(ormEntity.convertedToPhysicalAt)
        : undefined,
      physicalCardPriceToCover: Number(ormEntity.physicalCardPriceToCover),
      physicalCardCoveredAt: ormEntity.physicalCardCoveredAt
        ? new DateVO(ormEntity.physicalCardCoveredAt)
        : undefined,
      blockedAt: ormEntity.blockedAt
        ? new DateVO(ormEntity.blockedAt)
        : undefined,
      isPinSet: ormEntity.isPinSet,
      cardDigitalizations: ormEntity.cardDigitalizations.map(
        (CardDigitalizationProp) =>
          new CardDigitalization(CardDigitalizationProp),
      ),
      embossedName: ormEntity.embossedName,
      suffix: ormEntity.suffix,
      pinTryExceeded: ormEntity.pinTryExceeded,
      design: ormEntity.design,
    }
    return { id, props }
  }
}
