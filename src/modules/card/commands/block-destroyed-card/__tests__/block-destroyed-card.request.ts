import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildBlockDestroyedCardRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    blockDestroyedCard: () =>
      send({
        query: /* graphql */ `
          mutation {
            blockDestroyedCard {
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
