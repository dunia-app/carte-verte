import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantFilterOrmEntity } from '../../../modules/merchant/database/merchant-filter/merchant-filter.orm-entity'
import { MerchantFilterRepository } from '../../../modules/merchant/database/merchant-filter/merchant-filter.repository'
import { MerchantFilterEntity } from '../../../modules/merchant/domain/entities/merchant-filter.entity'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'
import { merchantFilters } from './merchant-filter'

export async function merchantFiltersFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const repo = new MerchantFilterRepository(
    connection.getRepository(MerchantFilterOrmEntity),
    config,
  )
  const merchantFilterEntities = merchantFilters.map(
    (merchantFilter) =>
      new MerchantFilterEntity({
        id: UUID.generate(),
        props: {
          code: merchantFilter.code,
          name: merchantFilter.name,
          parentCode: merchantFilter.parentCode,
        },
      }),
  )

  const existingMerchantFilters = await repo.findMany()
  const merchantFilterToSave = merchantFilterEntities.filter(
    (merchantFilter) =>
      !existingMerchantFilters.find(
        (existingMerchantFilter) =>
          existingMerchantFilter.code === merchantFilter.code,
      ),
  )

  if (merchantFilterToSave.length) {
    console.log('merchantFilters fixtures pushing')
    console.time(`saving ${merchantFilterToSave.length} merchantFilters`)
    await repo.saveMultiple(merchantFilterToSave)
    console.timeEnd(`saving ${merchantFilterToSave.length} merchantFilters`)
  }
  connection.destroy()
}
