import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { ExternalValidationPayload } from './../accept-transaction.request.dto'

export function buildAcceptTransactionRequests(app: INestApplication) {
  const appRequest = () =>
    request(app.getHttpServer()).post(`/externalvalidation`)

  return buildRequests(app, (_send: any) => ({
    acceptTransaction: (data: ExternalValidationPayload) =>
      appRequest().send(data),
  }))
}
