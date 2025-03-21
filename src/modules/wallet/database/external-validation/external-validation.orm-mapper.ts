import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import {
  ExternalValidationEntity,
  ExternalValidationProps,
} from '../../domain/entities/external-validation.entity'
import { ExternalValidationOrmEntity } from './external-validation.orm-entity'

export class ExternalValidationOrmMapper extends OrmMapper<
  ExternalValidationEntity,
  ExternalValidationOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: ExternalValidationEntity,
  ): OrmEntityProps<ExternalValidationOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<ExternalValidationOrmEntity> = {
      cardPublicToken: props.cardPublicToken,
      paymentAmount: props.paymentAmount,
      paymentDate: props.paymentDate,
      mcc: props.mcc.value,
      mid: props.mid,
      merchantName: props.merchantName,
      authorizationIssuerId: props.authorizationIssuerId,
      cardId: props.cardId?.value,
      responseCode: props.responseCode,
      declinedReason: props.declinedReason,
      siret: props.siret,
      msToAnswer: props.msToAnswer,
      triedMerchantMatching: props.triedMerchantMatching,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: ExternalValidationOrmEntity,
  ): EntityProps<ExternalValidationProps> {
    const id = new UUID(ormEntity.id)
    const props: ExternalValidationProps = {
      cardPublicToken: ormEntity.cardPublicToken,
      paymentAmount: Number(ormEntity.paymentAmount),
      paymentDate: ormEntity.paymentDate,
      mcc: new MCC(ormEntity.mcc),
      mid: ormEntity.mid,
      merchantName: ormEntity.merchantName,
      authorizationIssuerId: ormEntity.authorizationIssuerId,
      cardId: ormEntity.cardId ? new UUID(ormEntity.cardId) : undefined,
      responseCode: ormEntity.responseCode,
      declinedReason: ormEntity.declinedReason
        ? ormEntity.declinedReason
        : undefined,
      siret: ormEntity.siret ? ormEntity.siret : undefined,
      msToAnswer: ormEntity.msToAnswer ? ormEntity.msToAnswer : undefined,
      triedMerchantMatching: ormEntity.triedMerchantMatching
        ? ormEntity.triedMerchantMatching
        : undefined,
    }
    return { id, props }
  }
}
