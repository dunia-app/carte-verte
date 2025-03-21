import { join } from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'
import { isDevEnv, isProductionEnv } from '../../helpers/is_env'
import loadEnv from '../../helpers/load_env'

loadEnv()

export async function newConnection(
  overrideConfig = {} as Partial<DataSourceOptions>,
) {
  try {
    const myDataSource = new DataSource({
      type: 'postgres' as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      entities: [join(__dirname, '../../**/*.orm-entity.{ts,js}')],
      subscribers: [join(__dirname, '../../**/**.subscribe{r,rs}.{ts,js}')],
      synchronize: false,
      logging: !!isDevEnv,
      debug: !isProductionEnv,
      ...(overrideConfig as any),
    })
    console.log('Initializing Data Source');
    await myDataSource.initialize()
    console.log('Data Source has been initialized');
    return myDataSource
  } catch (e) {
    console.log('connection error: ', e)
    throw new Error(`connection error: ${e}`)
  }
}