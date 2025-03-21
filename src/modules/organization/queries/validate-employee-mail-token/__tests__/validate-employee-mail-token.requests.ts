import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { ValidateEmployeeMailTokenRequest } from '../validate-employee-mail-token.request.dto'

export function buildValidateEmployeeMailTokenRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    validateEmployeeMailToken: (input: ValidateEmployeeMailTokenRequest) =>
      send({
        query: /* graphql */ `
          query($input: ValidateEmployeeMailTokenRequest!) {
            validateEmployeeMailToken(input: $input) {
              result
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
