import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { ValidateEmployeeSmsTokenRequest } from '../validate-employee-sms-token.request.dto'

export function buildValidateEmployeeSmsTokenRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    validateEmployeeSmsToken: (input: ValidateEmployeeSmsTokenRequest) =>
      send({
        query: /* graphql */ `
          query($input: ValidateEmployeeSmsTokenRequest!) {
            validateEmployeeSmsToken(input: $input) {
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
