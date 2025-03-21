import { MerchantMerchantFilterOrmEntity } from '../../../modules/merchant/database/merchant-merchant-filter/merchant-merchant-filter.orm-entity'
import { MerchantMerchantFilterRepository } from '../../../modules/merchant/database/merchant-merchant-filter/merchant-merchant-filter.repository'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'

export async function merchantMerchantFiltersFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const repo = new MerchantMerchantFilterRepository(
    connection.getRepository(MerchantMerchantFilterOrmEntity),
    config,
  )
  const exists = await repo.findOne()
  if (!exists) {
    await connection.createQueryRunner().query(
      `INSERT INTO merchant_merchant_filter (mid, code)
      SELECT merchant.mid, 
            CASE merchant_category.mcc
                WHEN '5462' THEN 'MEALTICKET_BAKERY'
                WHEN '5812' THEN 'MEALTICKET_RESTAURANT'
                WHEN '5814' THEN 'MEALTICKET_RESTAURANT'
                WHEN '5411' THEN 'MEALTICKET_SUPERMARKET'
            END
      FROM merchant
      JOIN merchant_category ON merchant_category.id = merchant."merchantCategoryId"
      WHERE merchant_category.mcc IN ('5462', '5812', '5814', '5411')
      ON CONFLICT (mid, code) 
      DO NOTHING`,
    )
  }

  connection.destroy()
}
