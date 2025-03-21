import { Column, Entity, Index, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('merchant_merchant_organization')
@Unique('UQ_merchant_merchant_organization_mid_name', [
  'mid',
  'merchantName',
])
@Index('IDX_merchant_merchant_organization_siret', ['siret'])
@Index('IDX_merchant_merchant_organization_mid', ['mid'])
export class MerchantMerchantOrganizationOrmEntity extends TypeormEntityBase {
  constructor(props?: MerchantMerchantOrganizationOrmEntity) {
    super(props)
  }
  @Column('varchar')
  mid!: string

  @Column('varchar')
  merchantName!: string

  @Column('varchar')
  siret!: string
}
