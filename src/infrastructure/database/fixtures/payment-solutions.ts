import { OrmEntityProps } from '../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { PaymentSolutionOrmEntity } from '../../../modules/merchant/database/payment-solution/payment-solution.orm-entity'

export const paymentSolutions: OrmEntityProps<PaymentSolutionOrmEntity>[] = [
  {
    name: 'sumup',
  },
  {
    name: 'zettle',
  },
  {
    name: 'zenchef',
  },
  {
    name: 'lyfpay',
  },
  {
    name: 'mgp',
  },
  {
    name: 'lsp',
  },
  {
    name: 'smilep',
  },
  {
    name: 'sq',
  },
  {
    name: 'paygreen',
  },
  {
    name: 'nyx',
  },
  {
    name: 'mol',
  },
  {
    name: 'ppg',
  },
  {
    name: 'nya',
  },
  {
    name: 'ccv',
  },
  {
    name: 'sunday',
  },
]
