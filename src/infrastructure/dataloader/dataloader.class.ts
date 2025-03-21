import DataLoader from 'dataloader'
import { NestDataLoader } from './dataloader.interceptor'

export type LoaderType<T = any> = DataLoader<string, T>

export type DataLoaderQuery<Type> = (
  keys: string[],
  options?: any,
) => Promise<Type[]>

export type ManyByOwnerOptions = {
  whereQuery?: [string, any[]]
  limit?: number
  orderBy?: any
  ownerIdKey?: string
}

export interface IOrderedNestDataLoaderOptions<Type> {
  propertyKey?: string
  queryName?: string
  // options passed down to the query function
  queryOptions?: ManyByOwnerOptions
  typeName?: string
  dataloaderConfig?: DataLoader.Options<string, Type>
}

type EnsureOrderOptions = {
  docs: any[]
  keys: any[]
  prop: string
  error: (keyValue: any) => string
}

// https://github.com/graphql/dataloader/issues/66#issuecomment-386252044
const ensureOrder = (options: EnsureOrderOptions) => {
  const {
    docs,
    keys,
    prop,
    error = (key: any) => `Document does not exist (${key})`,
  } = options
  // Put documents (docs) into a map where key is a document's ID or some
  // property (prop) of a document and value is a document.
  const docsMap = new Map()
  docs.forEach((doc) => {
    docsMap.set(doc[prop], doc)
  })
  // Loop through the keys and for each one retrieve proper document. For not
  // existing documents generate an error.
  return keys.map((key) => {
    return (
      docsMap.get(key) ||
      new Error(typeof error === 'function' ? error(key) : error)
    )
  })
}

export type DataLoaderGetOptions<Type = any> =
  () => IOrderedNestDataLoaderOptions<Type>

export abstract class OrderedNestDataLoader<Type>
  implements NestDataLoader<Type>
{
  protected abstract getOptions: DataLoaderGetOptions<Type>

  // loaders: Map<string, DataLoader<string, Type>>
  // constructor() {
  //   super()
  // this.loaders = new Map()
  // }

  generateDataLoader(options = {} as IOrderedNestDataLoaderOptions<Type>) {
    return this.createLoader({
      ...this.getOptions(),
      ...options,
    })
  }

  createLoader(options: IOrderedNestDataLoaderOptions<Type>) {
    const loaderName = this.constructor.name
    // let loader = this.loaders.get(loaderName)
    // if (loader) return loader

    const defaultTypeName = loaderName.replace('Loader', '')
    const queryName = options.queryName || 'query'
    const query = (this as any)[queryName] as DataLoaderQuery<Type>

    const queryOptions = options.queryOptions || {}

    if (!query) {
      throw new Error(`Could not find data loader query named = ${queryName}`)
    }

    return new DataLoader<string, Type>(async (keys: readonly string[]) => {
      const keysParameter = [...keys]
      return ensureOrder({
        docs: await query(keysParameter, queryOptions),
        keys: keys as any[],
        prop: options.propertyKey || 'id',
        error: (keyValue) =>
          `${loaderName}: ${
            options.typeName || defaultTypeName
          } does not exist (${keyValue})`,
      })
    }, options.dataloaderConfig)
  }
}
