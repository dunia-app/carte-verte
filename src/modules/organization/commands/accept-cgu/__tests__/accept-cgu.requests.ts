import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildAcceptCguRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    acceptCgu: () =>
      send({
        query: /* graphql */ `
          mutation {
            acceptCgu {
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
