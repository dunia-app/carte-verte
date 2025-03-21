// @ts-nocheck
declare module 'migrate' {
  export type SetFn = {
    up: (cb?: (err: any) => void) => void
    up: (...migrations: string[], cb?: (err: any) => void) => void

    lastRun: string
    migrations: any[]
  }

  export class StateStore {
    load: (fn: any) => Promise<any>
    save: (set: SetFn, fn: any) => Promise<any>
  }

  type LoadOptions = {
    // set: A set instance if you created your own
    set?: any
    // stateStore: A store instance to load and store migration state, or a string which is a path to the migration state file
    stateStore?: StateStore
    // A filter function which will be called for each file found in the migrations directory
    filterFunction?: any
    // A sort function to ensure migration order
    sortFunction?: any
    // The directory to look for migrations in
    migrationsDirectory?: string
  }

  type Migrate = {
    load: (opts: LoadOptions, cb: (err: any, set: SetFn) => void) => void
  }

  const migrate: Migrate

  export default migrate
}
