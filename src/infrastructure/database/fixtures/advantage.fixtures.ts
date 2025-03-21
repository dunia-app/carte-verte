import { AdvantageOrmEntity } from '../../../modules/merchant/database/advantage/advantage.orm-entity'
import { AdvantageRepository } from '../../../modules/merchant/database/advantage/advantage.repository'
import { MerchantOrmEntity } from '../../../modules/merchant/database/merchant/merchant.orm-entity'
import { MerchantRepository } from '../../../modules/merchant/database/merchant/merchant.repository'
import { AdvantageEntity } from '../../../modules/merchant/domain/entities/advantage.entity'
import {
  AdvantagePeriod,
  AdvantageType,
  transactionSuperLimit,
} from '../../../modules/merchant/domain/entities/advantage.types'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'

export async function advantagesFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const advantageRepo = new AdvantageRepository(
    connection.getRepository(AdvantageOrmEntity),
    new MerchantRepository(connection.getRepository(MerchantOrmEntity), config),
    config,
  )

  const advantageProps: AdvantageEntity[] = [
    AdvantageEntity.create({
      name: 'None',
      description: 'None',
      type: AdvantageType.NONE,
      index: 10,
      legalLimit: transactionSuperLimit,
      limitPeriod: AdvantagePeriod.DAILY,
      // For the moment we set the same as MealTicket for simplicity
      workingDaysOnly: true,
    }),
    AdvantageEntity.create({
      name: 'External',
      description: 'External',
      type: AdvantageType.EXTERNAL,
      index: 11,
      legalLimit: transactionSuperLimit,
      limitPeriod: AdvantagePeriod.DAILY,
      // For the moment we set the same as MealTicket for simplicity
      workingDaysOnly: true,
    }),
  ]

  const existingAdvantage = await advantageRepo.findManyByType(
    advantageProps.map((advantage) => advantage.type),
  )

  const advantageToSave: AdvantageEntity[] = []
  await Promise.all(
    advantageProps.map(async (advantage) => {
      const exists = existingAdvantage.find(
        (existing) => existing.type === advantage.type,
      )
      if (!exists) {
        advantageToSave.push(advantage)
      }
    }),
  )

  if (advantageToSave.length > 0) {
    console.log('advantages fixtures pushing')
    console.time(`saving ${advantageToSave.length} advantages`)
    await advantageRepo.saveMultiple(advantageToSave)
    console.timeEnd(`saving ${advantageToSave.length} advantages`)
  }
  connection.destroy()
}
