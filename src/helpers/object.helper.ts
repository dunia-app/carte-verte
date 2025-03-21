import _ from 'lodash'
import { TArrayWithStringKeys } from '../libs/types/t-with-keys'

export function objectArrayToMap<T, K extends keyof T, MKey = string>(
  items: T[],
  key = 'id' as K,
  handleKey?: (item: T) => MKey,
) {
  const result: Map<MKey, T> = new Map()
  items.map((it) => {
    const keyValue = handleKey ? handleKey(it) : _.get(it, key)
    result.set(keyValue, it)
  })
  return result
}

export function objectArrayToObjectArrayKey<T, K extends keyof T, R = T>(
  items: T[],
  key = 'id' as K,
  handleKey?: (item: T) => string,
  handleObject?: (item: T) => R,
) {
  const result: TArrayWithStringKeys<R[]> = {}
  items.map((it) => {
    const keyValue = handleKey ? handleKey(it) : _.get(it, key)
    result[keyValue] = Array.isArray(result[keyValue])
      ? result[keyValue]
      : ([] as R[])
    result[keyValue].push(handleObject ? handleObject(it) : (it as any))
  })
  return result
}

export function findDuplicates<T>(items: T[]): T[] {
  const uniques = new Set(items)
  return items.filter((item) => {
    if (uniques.has(item)) {
      uniques.delete(item)
    } else {
      return item
    }
  })
}

export function validateObject(obj: any, structure: Record<string, any>): string | undefined {
  const keys = Object.keys(structure);
  for (const key of keys) {
    if (!(key in obj)) {
      return key;
    }
  }
  return undefined;
}
