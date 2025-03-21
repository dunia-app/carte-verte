import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { SetEmployeeAccountRequest } from '../set-employee-account.request.dto'

export function buildSetEmployeeAccountRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    setEmployeeCode: (input: SetEmployeeAccountRequest) =>
      send({
        query: /* graphql */ `
          mutation($input: SetEmployeeAccountRequest!) {
            setEmployeeAccount(input: $input) {
              result{jwtToken}
              error {
                ...on BaseGraphqlError {message code}
              }
            }
          }
        `,
        variables: {
          input: input,
        },
      }),
  }))
}
