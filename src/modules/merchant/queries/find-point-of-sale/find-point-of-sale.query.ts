import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { PointOfSaleResponse } from '../../dtos/merchant.response.dto'

// Query is a plain object with properties
export class FindPointOfSaleQuery extends Query<
  PointOfSaleResponse,
  PlaceNotFoundError
> {
  constructor(props: QueryProps<FindPointOfSaleQuery>) {
    super(props)
    this.pointOfSaleId = props.pointOfSaleId
    this.organizationId = props.organizationId
  }

  readonly pointOfSaleId: string

  readonly organizationId: string
}
