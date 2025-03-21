import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'

// async removeOrganizationAdmin(
//     @CurrentUser() organizationAdmin: OrganizationAdminEntity,
//     @Args('organizationAdminId', ParseUUIDPipe) organizationAdminId: string,
//   ): Promise<RemoveOrganizationAdminResponse> {

export function buildRemoveOrganizationAdminRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    removeOrganizationAdmin: (organizationAdminId: string) =>
      send({
        query: /* graphql */ `
            mutation($organizationAdminId: String!) {
                removeOrganizationAdmin(organizationAdminId: $organizationAdminId) {
                result
                error {
                    ...on BaseGraphqlError {message code}
                }
                }
            }
            `,
        variables: {
          organizationAdminId: organizationAdminId,
        },
      }),
  }))
}
