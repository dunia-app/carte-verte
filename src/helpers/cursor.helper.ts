type CursorResult = {
  before?: string
  after?: string
}

export type OrderName = 'ASC' | 'DESC'

export enum CursorDirection {
  BEFORE = '>',
  AFTER = '<',
}

export async function buildCursorsFromItems<T, DKey extends keyof T>(
  items: T[],
  hasBeforeCursor: (date: any) => Promise<boolean>,
  hasAfterCursor: (date: any) => Promise<boolean>,
  dateKey = 'date' as DKey,
): Promise<CursorResult> {
  const result: CursorResult = {}
  if (!items?.length) return result

  const first = items[0]
  const last = items[items.length - 1]
  const [hasBefore, hasAfter] = await Promise.all([
    hasBeforeCursor(first[dateKey]),
    hasAfterCursor(last[dateKey]),
  ])

  if (hasBefore) {
    result.before = buildCursor(CursorDirection.BEFORE, first[dateKey])
  }
  if (hasAfter) {
    result.after = buildCursor(CursorDirection.AFTER, last[dateKey])
  }
  return result
}

function buildCursor(direction: CursorDirection, value: any) {
  const toStr = value instanceof Date ? value.toISOString() : value
  const toEncode = `${direction};${toStr}`
  return toBase64(toEncode)
}

export function toBase64(value: string) {
  return Buffer.from(value).toString('base64')
}

export function fromBase64(value: string) {
  return Buffer.from(value, 'base64').toString()
}
