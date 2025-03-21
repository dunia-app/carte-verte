/**
 * Say if value is undefined
 */
export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined'
}
