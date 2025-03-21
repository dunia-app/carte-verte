import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildBlockStolenCardRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    blockStolenCard: () =>
      send({
        query: /* graphql */ `
          mutation {
            blockStolenCard {
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
