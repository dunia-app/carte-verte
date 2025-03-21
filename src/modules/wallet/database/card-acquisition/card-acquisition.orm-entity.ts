import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { EmployeeOrmEntity } from '../../../organization/database/employee/employee.orm-entity'
import {
  CardAcquisitionPayinStatus,
  cardAcquisitionPayinStatusEnumName,
} from '../../domain/entities/card-acquisition-payin.types'

@Entity('card_acquisition')
@Unique('UQ_card_acquisition_external_id', ['externalId'])
export class CardAcquisitionOrmEntity extends TypeormEntityBase {
  constructor(props?: CardAcquisitionOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column({ type: 'varchar', unique: true })
  externalId!: string

  @Column('uuid')
  employeeId!: string

  @Column('varchar')
  token!: string

  @Column('boolean')
  isActive!: boolean

  @Column('varchar')
  maskedPan!: string

  @Column('varchar')
  paymentProduct!: string

  @Column({
    type: 'enum',
    enum: CardAcquisitionPayinStatus,
    enumName: cardAcquisitionPayinStatusEnumName,
  })
  status: CardAcquisitionPayinStatus

  @Column('varchar')
  baasId: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => EmployeeOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  private _employee!: never
}
