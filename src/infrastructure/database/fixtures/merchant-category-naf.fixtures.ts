import { MerchantCategoryNafOrmEntity } from '../../../modules/merchant/database/merchant-category-naf/merchant-category-naf.orm-entity'
import { newConnection } from '../create_connection'
import { merchantCategoryNafs } from './merchant-category-naf'

export async function merchantCategoryNafsFixtures() {
  const connection = await newConnection({ logging: false })
  const repo = connection.getRepository(MerchantCategoryNafOrmEntity)
  const merchantCategoryNafEntities = merchantCategoryNafs.map(
    (merchantCategoryNaf) =>
      new MerchantCategoryNafOrmEntity(merchantCategoryNaf),
  )

  const existingMerchantCategoryNafs = await repo.find()
  const merchantCategoryNafToSave = merchantCategoryNafEntities.filter(
    (merchantCategoryNaf) =>
      !existingMerchantCategoryNafs.find(
        (existingMerchantCategoryNaf) =>
          existingMerchantCategoryNaf.naf === merchantCategoryNaf.naf,
      ),
  )

  if (merchantCategoryNafToSave.length) {
    console.log('merchantCategoryNafs fixtures pushing')
    console.time(
      `saving ${merchantCategoryNafToSave.length} merchantCategoryNafs`,
    )
    await repo.save(merchantCategoryNafToSave)
    console.timeEnd(
      `saving ${merchantCategoryNafToSave.length} merchantCategoryNafs`,
    )
  }
  connection.destroy()
}
