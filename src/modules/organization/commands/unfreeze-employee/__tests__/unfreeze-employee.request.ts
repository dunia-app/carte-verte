import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

export function buildUnfreezeEmployeeRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    unfreezeEmployee: (employeeId: string) =>
      send({
        query: /* graphql */ `
          mutation($employeeId: String!) {
            unfreezeEmployee(employeeId: $employeeId) {
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
