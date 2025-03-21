import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  AdvantageType,
  advantageTypeEnumName,
} from '../../../merchant/domain/entities/advantage.types'
import { EmployeeOrmEntity } from '../../../organization/database/employee/employee.orm-entity'

@Entity('wallet')
@Unique('UQ_wallet_employeeId_advantage', ['employeeId', 'advantage'])
export class WalletOrmEntity extends TypeormEntityBase {
  constructor(props?: WalletOrmEntity) {
    super(props)
  }

  @Column('uuid')
  employeeId: string

  @Column()
  name: string

  @Column({ type: 'decimal' })
  balance: number

  @Column({ type: 'decimal' })
  authorizedBalance: number

  @Column({
    type: 'enum',
    enum: AdvantageType,
    enumName: advantageTypeEnumName,
  })
  advantage: AdvantageType

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => EmployeeOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  private _employee: never
}