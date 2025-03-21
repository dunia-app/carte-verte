import { newConnection } from '../create_connection'

export async function extensionsFixtures() {
  const connection = await newConnection({ logging: false })

  await connection.query('CREATE EXTENSION IF NOT EXISTS unaccent;')
  await connection.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;')

  await connection.destroy()
}
