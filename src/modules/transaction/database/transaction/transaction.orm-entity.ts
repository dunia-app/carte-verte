import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { CardOrmEntity } from '../../../card/database/card/card.orm-entity'
import { EmployeeOrmEntity } from '../../../organization/database/employee/employee.orm-entity'
import {
  TransactionDeclinedReason,
  TransactionStatus,
  transactionDeclinedReasonEnumName,
  transactionStatusEnumName,
} from '../../domain/entities/transaction.types'
import { TransactionAdvantageRepartitionProps } from '../../domain/value-objects/transaction-advantage-repartition.value-object'
import { TransferOrmEntity } from '../transfer/transfer.orm-entity'

@Entity('transaction')
@Unique('UQ_transaction_external_transaction_id', ['externalTransactionId'])
export class TransactionOrmEntity extends TypeormEntityBase {
  constructor(props?: TransactionOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid', { nullable: true })
  cardId?: string

  @Column('uuid', { nullable: true })
  employeeId?: string

  @Column('varchar')
  merchantId!: string

  @Column('varchar')
  merchantName!: string

  @Column('varchar')
  mcc!: string

  @Column('varchar')
  cardPublicToken!: string

  @Column('varchar')
  externalTransactionId!: string

  @Column('varchar')
  externalPaymentId!: string

  @Column({ type: 'timestamptz' })
  paymentDate!: Date

  @Column({ type: 'decimal' })
  amount!: number

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: transactionStatusEnumName,
  })
  status!: TransactionStatus

  @Column({ type: 'varchar', nullable: true })
  authorizationNote?: string

  @Column('varchar')
  authorizationResponseCode!: string

  @Column({
    type: 'enum',
    enum: TransactionDeclinedReason,
    enumName: transactionDeclinedReasonEnumName,
    nullable: true,
  })
  declinedReason?: TransactionDeclinedReason

  @Column({ type: 'timestamptz', nullable: true })
  expiredAt?: Date

  @Column({
    type: 'jsonb',
  })
  advantageRepartition!: TransactionAdvantageRepartitionProps

  @Column('uuid', { nullable: true })
  cashbackId?: string

  @Column({ type: 'varchar', nullable: true })
  authorizationIssuerId?: string

  @Column({ type: 'varchar', default: '100' })
  authorizationMti!: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => CardOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'cardId' })
  private _card!: never

  @ManyToOne(() => EmployeeOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'employeeId' })
  private _employee!: never

  @ManyToOne(() => TransferOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'cashbackId' })
  private _transfer!: never
}
