import { messageTemplateNameEnumsFixtures } from '../infrastructure/database/fixtures/message-template-name-enum.fixtures'
import { cleanupDatabase, cleanupRedis } from './cleanup_database'
import { runTaskMigration } from './run_task_migration'

require('ts-node').register('../tsconfig')

module.exports = async () => {
  console.log('cleanup database...')
  console.time('database was cleaned up')
  await cleanupDatabase()
  await cleanupRedis()
  console.timeEnd('database was cleaned up')
  console.log('running task migrations...')
  console.time('task migration runned')
  await runTaskMigration()
  console.timeEnd('task migration runned')
  // Required fixtures
  await messageTemplateNameEnumsFixtures()
}
