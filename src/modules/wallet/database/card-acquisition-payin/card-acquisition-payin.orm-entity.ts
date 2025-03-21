import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { EmployeeOrmEntity } from '../../../organization/database/employee/employee.orm-entity'
import {
  CardAcquisitionPayinStatus,
  cardAcquisitionPayinStatusEnumName,
} from '../../domain/entities/card-acquisition-payin.types'
import { CardAcquisitionOrmEntity } from '../card-acquisition/card-acquisition.orm-entity'

@Entity('card_acquisition_payin')
export class CardAcquisitionPayinOrmEntity extends TypeormEntityBase {
  constructor(props?: CardAcquisitionPayinOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar', { nullable: true })
  externalAuthorizationId?: string

  @Column('uuid')
  employeeId!: string

  @Column('varchar', { nullable: true })
  externalCardAcquisitionId?: string

  @Column('decimal')
  amount!: number

  @Column({
    type: 'enum',
    enum: CardAcquisitionPayinStatus,
    enumName: cardAcquisitionPayinStatusEnumName,
  })
  status!: CardAcquisitionPayinStatus

  @Column('varchar')
  reference!: string

  @Column({ nullable: true })
  transactionExternalPaymentId?: string

  @Column({ type: 'varchar', nullable: true })
  externalPayinId?: string

  @Column({ type: 'decimal', nullable: true })
  amountCaptured?: number

  @Column({ type: 'varchar', nullable: true })
  errorCode?: string

  @Column({ type: 'varchar', nullable: true })
  errorMessage?: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => EmployeeOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  private _employee!: never

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => CardAcquisitionOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'externalCardAcquisitionId',
    referencedColumnName: 'externalId',
  })
  private _cardAcquisition!: never
}
