const CustomStateStorage = require('../infrastructure/database/tasks/migrations_setup/store')
const migrate = require('migrate')

export async function runTaskMigration() {
  try {
    await new Promise<void>(async (resolve, reject) => {
      migrate.load(
        {
          stateStore: new CustomStateStorage(),
          migrationsDirectory:
            __dirname +
            '/../infrastructure/database/tasks/migrations/',
          filterFunction: (filename: string) => {
            return /\.js$/.test(filename)
          },
        },
        async function (err: any, set: any) {
          if (err) {
            return reject(err)
          }
          await set.up(function (err: any) {
            if (err) {
              return reject(err)
            }
            resolve()
            console.log('migrations successfully ran')
          })
        },
      )
    })
  } catch (err) {
    console.log('failed to run task migration: ', err)
    throw err
  }
}