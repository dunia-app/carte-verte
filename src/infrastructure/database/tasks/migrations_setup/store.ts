/// <reference path="../../../../definitions/migrate.d.ts" />
import { SetFn, StateStore } from 'migrate'
import { newConnection } from '../../create_connection'

const tableName = 'tasks_migrations'

const connectionName = 'tasks_migrations'

/**
 * Stores and loads the executed migrations in the database. The table
 * migrations is only one row and stores a JSON of the data that the
 * migrate package uses to know which migrations have been executed.
 */
class CustomStateStorage implements StateStore {
  async load(fn: any) {
    const pg = await newConnection({ name: connectionName, logging: false })
    try {
      // Load the single row of migration data from the database

      await pg.query(
        `CREATE TABLE IF NOT EXISTS ${tableName} (id integer PRIMARY KEY, data jsonb NOT NULL)`,
      )
      const rows = await pg.query(`SELECT data FROM ${tableName}`)

      if (rows.length !== 1) {
        console.log(
          'Cannot read migrations from database. If this is the first time you run migrations, then this is normal.',
        )
        return await fn(null, {})
      }

      // Call callback with new migration data object
      await fn(null, rows[0].data)
    } catch (e) {
      console.error('load error ', e)
    } finally {
      await pg.destroy()
    }
  }

  async save(set: SetFn, fn: any) {
    const pg = await newConnection({ name: connectionName, logging: false })
    try {
      // Check if table 'migrations' exists and if not, create it.

      await pg.query(
        `
      INSERT INTO ${tableName} (id, data)
      VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET data = $1
    `,
        [
          {
            lastRun: set.lastRun,
            migrations: set.migrations,
          },
        ],
      )

      await fn()
    } catch (e) {
      console.error('save error', e)
    } finally {
      await pg.destroy()
    }
  }
}

module.exports = CustomStateStorage;
