import {
  createParamDecorator,
  ExecutionContext,
  UnprocessableEntityException,
} from '@nestjs/common'
import _ from 'lodash'
import {
  getRequest,
  getResponse,
  logger,
} from '../../helpers/application.helper'
import { TWithStringKeys } from '../types/t-with-keys'

export function getRequestValue(
  keyName: string,
  fromHeader = false,
  isOptionnal = false,
) {
  return (_data: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx)
    if (fromHeader) return request.headers[keyName]
    const res = (request as TWithStringKeys)[keyName]
    if (!res) {
      logger.error('getRequestValue', `missing key ${keyName} in request`)
      if (!isOptionnal) {
        throw new UnprocessableEntityException('Missing key in request')
      }
    }
    return res
  }
}

export const CurrentUser = createParamDecorator(getRequestValue('user'))

export const CurrentDeviceId = createParamDecorator(getRequestValue('deviceId'))

export const CurrentOrganizationId = createParamDecorator(
  getRequestValue('organizationid', true),
)

export const Resp = createParamDecorator((_data, ctx: ExecutionContext) => {
  return getResponse(ctx)
})

export const HasQueryAttributeMap = () => {
  return createParamDecorator((_data: unknown, ctx: any) => {
    const hasAttributeMap = new Map<string, boolean>()

    const selections = _.get(
      ctx.args[3],
      'fieldNodes[0].selectionSet.selections',
    ) as ContextSelection[]

    if (selections?.length) {
      addAttributeToMap(selections, hasAttributeMap)
    }
    return hasAttributeMap
  })()
}

interface ContextSelection {
  name: { value: string }
  selectionSet?: { selections: ContextSelection[] }
}

function addAttributeToMap(
  selections: ContextSelection[],
  hasAttributeMap: Map<string, boolean>,
  prefix: string = '',
): void {
  selections.forEach((it) => {
    const value = it?.name?.value
    if (value) hasAttributeMap.set(prefix + value, true)
    if (it.selectionSet && it.selectionSet.selections.length) {
      addAttributeToMap(
        it.selectionSet.selections,
        hasAttributeMap,
        `${value}.`,
      )
    }
  })
}
