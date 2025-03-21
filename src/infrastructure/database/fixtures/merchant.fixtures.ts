import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantCategoryOrmEntity } from '../../../modules/merchant/database/merchant-category/merchant-category.orm-entity'
import { MerchantCategoryRepository } from '../../../modules/merchant/database/merchant-category/merchant-category.repository'
import { MerchantCategoryEntity } from '../../../modules/merchant/domain/entities/merchant-category.entity'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'
import { merchantCategories } from './merchants'

export async function merchantsFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const repo = new MerchantCategoryRepository(
    connection.getRepository(MerchantCategoryOrmEntity),
    config,
  )
  const merchantCategoryEntities = merchantCategories.map(
    (cat) =>
      new MerchantCategoryEntity({
        id: UUID.generate(),
        props: cat,
      }),
  )

  const existingCategories = await repo.findMany()
  const merchantCategoryToSave = merchantCategoryEntities.filter(
    (merchantCategory) =>
      !existingCategories.find(
        (existingMerchantCategory) =>
          existingMerchantCategory.mcc.value === merchantCategory.mcc.value,
      ),
  )

  if (merchantCategoryToSave.length) {
    console.log('merchants fixtures pushing')
    console.time(`saving ${merchantCategoryToSave.length} merchants categories`)
    await repo.saveMultiple(merchantCategoryToSave)
    console.timeEnd(
      `saving ${merchantCategoryToSave.length} merchants categories`,
    )
  }
  connection.destroy()
}
