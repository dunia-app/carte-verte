import IORedis from 'ioredis'
import { newConnection } from '../infrastructure/database/create_connection'

const schema = 'public'
const skipTables = ['schema_migrations', 'tasks_migrations']
const schemaPrefix = '"' + schema + '".'

export async function cleanupDatabase(doLog = false) {
  try {
    if (doLog) console.log('clean database start')
    const connection = await newConnection({
      name: 'test-cleanup',
      logging: doLog,
      debug: doLog,
    })
    await connection.transaction(async (transaction) => {
      const tables = await transaction.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = '" +
          schema +
          "' AND table_type = 'BASE TABLE';",
      )
      const length = tables.length
      if (length === 0) {
        // The database is empty
        console.log('database empty')
        return
      }
      const tableExpression = tables
        .filter((table : any) => {
          return skipTables.indexOf(table['table_name']) === -1
        })
        .map((table: any) => {
          return schemaPrefix + '"' + table['table_name'] + '"'
        })
        .join(', ')

      // no tables to truncate
      if (!tableExpression) {
        console.log('database clean: no tables to truncate')
        return
      }
      if (doLog) console.log('TRUNCATE table', tableExpression)
      await transaction.query(
        'TRUNCATE TABLE ' + tableExpression + ' RESTART IDENTITY CASCADE',
      )
      if (doLog) console.log('cleaned tables')
    })
    if (doLog) console.log('finished db cleanup')
    await connection.destroy()
  } catch (err) {
    console.log('failed to clean database: ', err)
    throw err
  }
}

export async function cleanupRedis() {
  const cache = new IORedis({
    port: Number(process.env['REDIS_PORT']),
    host: process.env['REDIS_HOST'],
    connectTimeout: 500,
    maxRetriesPerRequest: 1,
  })

  await cache.flushdb()

  cache.disconnect()
}
