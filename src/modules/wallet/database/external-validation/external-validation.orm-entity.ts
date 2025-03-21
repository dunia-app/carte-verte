import { Column, Entity } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  TransactionDeclinedReason,
  transactionDeclinedReasonEnumName,
} from '../../../transaction/domain/entities/transaction.types'
import {
  ExternalValidationResponseCode,
  externalValidationResponseEnumName,
} from '../../domain/entities/external-validation.types'

@Entity('external_validation')
export class ExternalValidationOrmEntity extends TypeormEntityBase {
  constructor(props?: ExternalValidationOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar')
  cardPublicToken!: string

  @Column('decimal')
  paymentAmount!: number

  @Column('timestamptz')
  paymentDate!: Date

  @Column('varchar')
  mcc!: string

  @Column('varchar')
  mid!: string

  @Column('varchar')
  merchantName!: string

  @Column('varchar')
  authorizationIssuerId!: string

  @Column({ type: 'uuid', nullable: true })
  cardId?: string

  @Column({
    type: 'enum',
    enum: ExternalValidationResponseCode,
    enumName: externalValidationResponseEnumName,
  })
  responseCode!: ExternalValidationResponseCode

  @Column({
    type: 'enum',
    enum: TransactionDeclinedReason,
    enumName: transactionDeclinedReasonEnumName,
    nullable: true,
  })
  declinedReason?: TransactionDeclinedReason

  @Column({ type: 'varchar', nullable: true })
  siret?: string

  @Column({ type: 'decimal', nullable: true })
  msToAnswer?: number

  @Column({ type: 'boolean', nullable: true })
  triedMerchantMatching?: boolean
}
