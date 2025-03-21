import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import {
  TransactionEntity,
  TransactionProps,
} from '../../domain/entities/transaction.entity'
import { BaasAuthorizationResponseCode } from '../../domain/value-objects/baas-authorization-response-code.value-object'
import { TransactionAdvantageRepartition } from '../../domain/value-objects/transaction-advantage-repartition.value-object'
import { TransactionOrmEntity } from './transaction.orm-entity'

export class TransactionOrmMapper extends OrmMapper<
  TransactionEntity,
  TransactionOrmEntity
> {
  protected encryptedFields = [] as const

  protected toOrmProps(
    entity: TransactionEntity,
  ): OrmEntityProps<TransactionOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<TransactionOrmEntity> = {
      cardId: props.cardId?.value,
      employeeId: props.employeeId?.value,
      merchantId: props.merchantId,
      merchantName: props.merchantName,
      mcc: props.mcc.value,
      cardPublicToken: props.cardPublicToken,
      externalTransactionId: props.externalTransactionId,
      externalPaymentId: props.externalPaymentId,
      paymentDate: props.paymentDate.value,
      amount: props.amount,
      status: props.status,
      authorizationNote: props.authorizationNote,
      authorizationResponseCode: props.authorizationResponseCode.value,
      declinedReason: props.declinedReason,
      expiredAt: props.expiredAt?.value,
      advantageRepartition: props.advantageRepartition.unpack(),
      cashbackId: props.cashbackId?.value,
      authorizationIssuerId: props.authorizationIssuerId,
      authorizationMti: props.authorizationMti,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: TransactionOrmEntity,
  ): EntityProps<TransactionProps> {
    const id = new UUID(ormEntity.id)
    const props: TransactionProps = {
      cardId: ormEntity.cardId ? new UUID(ormEntity.cardId) : undefined,
      employeeId: ormEntity.employeeId
        ? new UUID(ormEntity.employeeId)
        : undefined,
      merchantId: ormEntity.merchantId,
      merchantName: ormEntity.merchantName,
      mcc: new MCC(ormEntity.mcc),
      cardPublicToken: ormEntity.cardPublicToken,
      externalTransactionId: ormEntity.externalTransactionId,
      externalPaymentId: ormEntity.externalPaymentId,
      paymentDate: new DateVO(ormEntity.paymentDate),
      amount: Number(ormEntity.amount),
      status: ormEntity.status,
      authorizationNote: ormEntity.authorizationNote,
      authorizationResponseCode: new BaasAuthorizationResponseCode(
        ormEntity.authorizationResponseCode,
      ),
      declinedReason: ormEntity.declinedReason,
      expiredAt: ormEntity.expiredAt
        ? new DateVO(ormEntity.expiredAt)
        : undefined,
      advantageRepartition: new TransactionAdvantageRepartition(
        ormEntity.advantageRepartition,
      ),
      cashbackId: ormEntity.cashbackId
        ? new UUID(ormEntity.cashbackId)
        : undefined,
      authorizationIssuerId: ormEntity.authorizationIssuerId,
      authorizationMti: ormEntity.authorizationMti,
    }
    return { id, props }
  }
}
