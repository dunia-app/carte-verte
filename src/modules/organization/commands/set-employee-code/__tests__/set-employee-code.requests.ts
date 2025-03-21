import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { SetEmployeeCodeRequest } from '../set-employee-code.request.dto'

export function buildSetEmployeeCodeRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    setEmployeeCode: (input: SetEmployeeCodeRequest) =>
      send({
        query: /* graphql */ `
          mutation($input: SetEmployeeCodeRequest!) {
            setEmployeeCode(input: $input) {
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
