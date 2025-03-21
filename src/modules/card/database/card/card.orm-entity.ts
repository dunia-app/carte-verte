import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { EmployeeOrmEntity } from '../../../organization/database/employee/employee.orm-entity'
import {
  CardDesign,
  cardDesignEnumName,
  LockStatus,
  lockStatusEnumName,
} from '../../domain/entities/card.types'
import { CardDigitalizationProps } from '../../domain/value-objects/card-digitalization.value-object'

@Entity('card')
export class CardOrmEntity extends TypeormEntityBase {
  constructor(props?: CardOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  employeeId!: string

  @Column('varchar')
  externalId!: string

  @Column('varchar')
  publicToken!: string

  @Column({
    type: 'enum',
    enum: LockStatus,
    enumName: lockStatusEnumName,
  })
  lockStatus!: LockStatus

  @Column({ nullable: true, type: 'timestamptz' })
  activatedAt?: Date

  @Column({ nullable: true, type: 'timestamptz' })
  requestedToConvertToPhysicalAt?: Date | null

  @Column({ nullable: true, type: 'timestamptz' })
  convertedToPhysicalAt?: Date

  @Column({ default: 0, type: 'decimal' })
  physicalCardPriceToCover!: number

  @Column({ nullable: true, type: 'timestamptz' })
  physicalCardCoveredAt?: Date | null

  @Column({ nullable: true, type: 'timestamptz' })
  blockedAt?: Date

  @Column({ type: 'boolean', default: false })
  isPinSet!: boolean

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  cardDigitalizations!: CardDigitalizationProps[]

  @Column('varchar')
  embossedName!: string

  @Column('varchar')
  suffix!: string

  @Column({ type: 'boolean', default: false })
  pinTryExceeded!: boolean

  @Column({
    type: 'enum',
    enum: CardDesign,
    enumName: cardDesignEnumName,
  })
  design!: CardDesign

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
