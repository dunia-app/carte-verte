import { DataSource } from 'typeorm'

const loadEnv = require('./src/helpers/load_env.js')
const fs = require('fs')

let rootFolder = 'dist/src/'
if (!fs.existsSync(`./${rootFolder}`)) {
  console.log(' ----- \n')
  console.log('dist folder is missing. Build the project before continuing')
  console.log('aborting...')
  console.log('\n ----- ')
  process.exit(1)
}

loadEnv();

console.log('Loaded environment variables:')
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_USERNAME:', process.env.DB_USERNAME)
console.log('DB_DATABASE_NAME', process.env.DB_DATABASE_NAME)

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  entities: [`${rootFolder}/**/database/**/**.orm-entity.{ts,js}`],
  subscribers: [`${rootFolder}modules/**/**.subscribers.{ts,js}`],
  migrationsTableName: 'schema_migrations',
  migrations: [`${rootFolder}infrastructure/database/migrations/**/**.{ts,js}`],
  logging: false,
})
