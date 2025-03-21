import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { CardResponse } from '../../dtos/card.response.dto'
import { CardNotFoundError } from '../../errors/card.errors'

// Query is a plain object with properties
export class FindCardQuery extends Query<CardResponse, CardNotFoundError> {
  constructor(props: QueryProps<FindCardQuery>) {
    super(props)
    this.employeeId = props.employeeId
    this.organizationId = props.organizationId
    this.addMaskedPan = props.addMaskedPan
    this.addIsPinLocked = props.addIsPinLocked
  }

  readonly employeeId: string

  readonly organizationId?: string

  readonly addMaskedPan: boolean

  readonly addIsPinLocked: boolean
}
