import { Column, Entity, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  AdvantageType,
  advantageTypeEnumName,
} from '../../domain/entities/advantage.types'

@Entity('merchant_filter')
@Unique('UQ_merchant_filter_code', ['code'])
export class MerchantFilterOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantFilterOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('varchar')
  code!: string

  @Column('varchar')
  name!: string

  @Column({
    type: 'enum',
    enum: AdvantageType,
    enumName: advantageTypeEnumName,
  })
  parentCode!: AdvantageType
}
