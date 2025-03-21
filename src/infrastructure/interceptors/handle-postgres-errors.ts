import { TWithStringKeys } from '../../libs/types/t-with-keys'

// matches "...  (email)=(value@example.com) ..."
const rgxDetailPathValue = /\((.*?)\)/g
const postgresErrorCodes: TWithStringKeys = {
  // UNIQUE_VIOLATION
  '23505': (err: any) => {
    const detail = err.detail
    const name = rgxDetailPathValue.exec(detail)
    const value = rgxDetailPathValue.exec(detail)
    return {
      path: name && name.length > 0 ? name[1] : null,
      type: 'unique',
      translateParams: {
        value: value && value.length > 0 ? value[1] : null,
      },
    }
  },
}

export function handlePostgresErrors(exception: any) {
  const codeHandle = postgresErrorCodes[exception.code]
  if (codeHandle) {
    return [codeHandle(exception)]
  }
  return exception
}
