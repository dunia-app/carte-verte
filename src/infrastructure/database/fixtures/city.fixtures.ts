import { CityOrmEntity } from '../../../modules/merchant/database/city/city.orm-entity'
import { newConnection } from '../create_connection'
import { cities } from './cities'

export async function citiesFixtures() {
  const connection = await newConnection({ logging: false })
  const repo = connection.getRepository(CityOrmEntity)
  const cityEntities = cities.map((city) => new CityOrmEntity(city))

  const existingCitys = await repo.find()
  const cityToSave = cityEntities.filter(
    (city) =>
      !existingCitys.find((existingCity) => existingCity.name === city.name),
  )

  if (cityToSave.length) {
    console.log('cities fixtures pushing')
    console.time(`saving ${cityToSave.length} cities`)
    await repo.save(cityToSave)
    console.timeEnd(`saving ${cityToSave.length} cities`)
  }
  connection.destroy()
}
