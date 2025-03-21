import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { DataWithPaginationMeta } from '../../../../libs/ddd/domain/ports/repository.ports'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'

// Query is a plain object with properties
export class FindEmployeesQuery extends Query<
  DataWithPaginationMeta<FindEmployeeResponseProps[]>
> {
  constructor(props: QueryProps<FindEmployeesQuery>) {
    super(props)
    this.organizationId = props.organizationId
    this.limit = props.limit
    this.offset = props.offset
    this.searchTerms = props.searchTerms
  }

  readonly organizationId: string

  readonly limit: number

  readonly offset: number

  readonly searchTerms?: string[]
}
