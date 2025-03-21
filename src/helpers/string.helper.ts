import _ from 'lodash'
import { TWithStringKeys } from '../libs/types/t-with-keys'

export function replaceVariablesByValue(
  value: string,
  variables: TWithStringKeys,
  variableSuffix: string = ':',
) {
  if (!variables || !value) return value

  const varMap = new Map()
  const keys = Object.keys(variables).map((it) => {
    const key = it[0] === `${variableSuffix}` ? it : `${variableSuffix}${it}`
    varMap.set(key.toLowerCase(), variables[it])

    return key
  })

  const rgx = keys.join('|')
  return value.replace(new RegExp(rgx, 'gi'), (match) => {
    const varValue = varMap.get(match.toLowerCase())
    if (!_.isUndefined(varValue)) return varValue

    // did not find a matching value, log ?
    return match
  })
}

export function capitalize(s: string) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function capitalizeEachWords(s: string) {
  if (typeof s !== 'string') return ''
  return s
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ')
}

export function isString(variable: any): variable is string {
  return typeof variable === 'string' || variable instanceof String
}

export function isStringArray(variable: any): variable is string[] {
  return Array.isArray(variable) && variable.every((item) => isString(item))
}

export function formatTextNoSpecial(s: string) {
  return s
    .replace(/-|'/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

export function removeWhitespace(s: string) {
  return s.replace(/\s/g, '')
}

export function decodeJWT<ReturnType>(token: string): ReturnType {
  const payloadBuffer = Buffer.from(token.split('.')[1], 'base64')
  return JSON.parse(payloadBuffer.toString()) as ReturnType
}
