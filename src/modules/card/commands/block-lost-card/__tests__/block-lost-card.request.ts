import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildBlockLostCardRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    blockLostCard: () =>
      send({
        query: /* graphql */ `
          mutation {
            blockLostCard {
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
