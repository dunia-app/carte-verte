import { newConnection } from '../create_connection'
import { advantagesFixtures } from './advantage.fixtures'
import { citiesFixtures } from './city.fixtures'
import { errorTypesFixtures } from './error-type.fixtures'
import { extensionsFixtures } from './extensions.fixture'
import { merchantCategoryNafsFixtures } from './merchant-category-naf.fixtures'
import { merchantFiltersFixtures } from './merchant-filter.fixture'
import { merchantMerchantFiltersFixtures } from './merchant-merchant-filter'
import { merchantsFixtures } from './merchant.fixtures'
import { messageTemplateNameEnumsFixtures } from './message-template-name-enum.fixtures'
import { organizationsFixtures } from './organization.fixtures'
import { paymentSolutionsFixtures } from './payment-solution.fixtures'
import { templatesFixtures } from './template.fixtures'
import { usersFixtures } from './user.fixtures'

newConnection({ logging: false }).then(async () => {
  const promises: Promise<any>[] = []
  promises.push(messageTemplateNameEnumsFixtures())
  promises.push(extensionsFixtures())
  await Promise.all(promises)

  const promises1: Promise<any>[] = []
  promises1.push(usersFixtures())
  promises1.push(organizationsFixtures())
  promises1.push(merchantsFixtures())
  promises1.push(templatesFixtures())
  promises1.push(citiesFixtures())
  promises1.push(paymentSolutionsFixtures())
  promises1.push(errorTypesFixtures())
  await Promise.all(promises1)

  const promises2: Promise<any>[] = []
  promises2.push(advantagesFixtures())
  promises2.push(merchantCategoryNafsFixtures())
  await Promise.all(promises2)

  const promises3: Promise<any>[] = []
  promises3.push(merchantFiltersFixtures())
  await Promise.all(promises3)

  const promises4: Promise<any>[] = []
  promises4.push(merchantMerchantFiltersFixtures())
  await Promise.all(promises4)

  console.log('Seed of fixtures done')
  process.exit(0)
})
