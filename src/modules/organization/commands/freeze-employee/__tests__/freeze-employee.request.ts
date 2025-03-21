import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildFreezeEmployeeRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    freezeEmployee: (employeeId: string) =>
      send({
        query: /* graphql */ `
          mutation($employeeId: String!) {
            freezeEmployee(employeeId: $employeeId) {
              result
              error {
                ...on BaseGraphqlError {message code}
              }
            }
          }
        `,
        variables: {
          employeeId: employeeId,
        },
      }),
  }))
}
