import { OrmEntityProps } from '../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { MerchantFilterOrmEntity } from '../../../modules/merchant/database/merchant-filter/merchant-filter.orm-entity'
import { AdvantageType } from '../../../modules/merchant/domain/entities/advantage.types'

export const merchantFilters: OrmEntityProps<MerchantFilterOrmEntity>[] = [
  {
    code: 'MEALTICKET_RESTAURANT',
    name: 'Restaurant',
    parentCode: AdvantageType.MEALTICKET,
  },
  {
    code: 'MEALTICKET_SUPERMARKET',
    name: 'Supermarché',
    parentCode: AdvantageType.MEALTICKET,
  },
  {
    code: 'MEALTICKET_BAKERY',
    name: 'Boulangerie',
    parentCode: AdvantageType.MEALTICKET,
  },
]
