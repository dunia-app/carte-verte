import { INestApplication } from '@nestjs/common'
import request from 'supertest'

export function buildRequests<T>(
  app: INestApplication,
  buildRequestObject: (send: (data?: string | Object) => request.Test) => T,
) {
  const postReq = () => request(app.getHttpServer()).post('/graphql')
  return buildRequestObject((data) => postReq().send(data))
}

export function buildControllerRequests<T>(
  app: INestApplication,
  buildRequestObject: (send: (data?: string | Object) => request.Test) => T,
) {
  const postReq = () => request(app.getHttpServer()).post('/')
  return buildRequestObject((data) => postReq().send(data))
}

export function getQueryData(resp: request.Response, queryNameIndex = 0) {
  if (resp.body.errors) return
  const queryName = Object.keys(resp.body.data)[queryNameIndex]
  const data = resp.body.data[queryName]
  return data
}

export function expectEqualResult<T = any, R = any>(
  getResultExpect?: (data: T) => Promise<R> | R,
  debug?: boolean,
  queryNameIndex = 0,
) {
  return async (resp: request.Response) => {
    if (debug) console.log(resp.body)

    expect(resp.status === 200 || resp.status === 201).toBeTruthy()
    const data = getQueryData(resp, queryNameIndex)

    if (!getResultExpect) return

    let resultExpect
    if (typeof getResultExpect === 'function') {
      resultExpect = await getResultExpect(data)
    } else {
      resultExpect = getResultExpect
    }
    if (!resultExpect) return

    expect(data).toStrictEqual(resultExpect)
  }
}