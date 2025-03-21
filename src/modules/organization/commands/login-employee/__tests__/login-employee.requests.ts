import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { LoginEmployeeRequest } from '../login-employee.request.dto'

export function buildLoginEmployeeRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    loginEmployee: (input: LoginEmployeeRequest) =>
      send({
        query: /* graphql */ `
          mutation($input: LoginEmployeeRequest!) {
            loginEmployee(input: $input) {
              result {
                jwtToken
                refreshToken
              }
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

    employeeStatus: (email: string) =>
      send({
        query: /* graphql */ `
          query($email: String!) {
            employeeStatus(email: $email) {
              result
              error {
                ...on BaseGraphqlError {message code}
              }
            }
          }
        `,
        variables: {
          email: email,
        },
      }),
  }))
}
