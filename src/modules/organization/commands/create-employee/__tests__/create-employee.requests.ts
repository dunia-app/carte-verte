import { INestApplication } from '@nestjs/common'
import { buildRequests } from '../../../../../tests/helpers/requests_helpers'
import { CreateEmployeeRequest } from '../create-employee.request.dto'

export function buildCreateEmployeeRequests(app: INestApplication) {
  return buildRequests(app, (send: any) => ({
    createEmployee: (input: CreateEmployeeRequest[]) =>
      send({
        query: /* graphql */ `
          mutation($input: [CreateEmployeeRequest!]!)  {
            createEmployee(input: $input)  {
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
