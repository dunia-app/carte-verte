import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { UpdateOrganizationAdminPasswordRequest } from '../update-organization-admin-password.request.dto'

export function buildUpdateOrganizationAdminPasswordRequests(
  app: INestApplication,
) {
  return buildRequests(app, (send: any) => ({
    updateOrganizationAdminPassword: (
      input: UpdateOrganizationAdminPasswordRequest,
    ) =>
      send({
        query: /* GraphQL */ `
          mutation ($input: UpdateOrganizationAdminPasswordRequest!) {
            updateOrganizationAdminPassword(input: $input) {
              result
              error {
                ... on BaseGraphqlError {
                  message
                  code
                }
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
