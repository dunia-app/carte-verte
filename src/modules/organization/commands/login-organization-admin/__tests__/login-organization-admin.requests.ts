import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { LoginOrganizationAdminRequest } from '../login-organization-admin.request.dto'

export function buildLoginOrganizationAdminRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    loginOrganizationAdmin: (input: LoginOrganizationAdminRequest) =>
      send({
        query: /* graphql */ `
          mutation($input: LoginOrganizationAdminRequest!) {
            loginOrganizationAdmin(input: $input) {
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
  }))
}
