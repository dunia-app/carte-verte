import { Column, Entity } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  AdvantagePeriod,
  AdvantageType,
  advantagePeriodEnumName,
  advantageTypeEnumName,
} from '../../domain/entities/advantage.types'

@Entity('advantage')
export class AdvantageOrmEntity extends TypeormEntityBase {
  constructor(props?: AdvantageOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar')
  name!: string

  @Column('varchar')
  description!: string

  @Column({
    type: 'enum',
    enum: AdvantageType,
    enumName: advantageTypeEnumName,
  })
  type!: AdvantageType

  @Column('integer')
  index!: number

  @Column({ type: 'decimal' })
  legalLimit!: number

  @Column({
    type: 'enum',
    enum: AdvantagePeriod,
    enumName: advantagePeriodEnumName,
  })
  limitPeriod!: AdvantagePeriod

  @Column('boolean')
  workingDaysOnly!: boolean
}
