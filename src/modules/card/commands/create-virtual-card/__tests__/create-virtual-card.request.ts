import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildCreateVirtualCardRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    createVirtualCard: () =>
      send({
        query: /* graphql */ `
          mutation {
            createVirtualCard {
              result
              error {
                ...on BaseGraphqlError {message code}
              }
            }
          }
        `,
      }),
  }))
}
