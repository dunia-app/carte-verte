import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import { CursorPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import {
  AdvantageForm,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'
import { PointOfSalesResponse } from '../../dtos/merchant.response.dto'

// Query is a plain object with properties
export class FindPointOfSalesQuery extends Query<
  PointOfSalesResponse,
  PlaceNotFoundError
> {
  constructor(props: QueryProps<FindPointOfSalesQuery>) {
    super(props)
    this.pagination = props.pagination
    this.organizationId = props.organizationId
    this.address = props.address
    this.latitude = props.latitude
    this.longitude = props.longitude
    this.advantageForm = props.advantageForm
    this.pointOfSaleType = props.pointOfSaleType
    this.radius = props.radius
  }

  readonly pagination: CursorPaginationBase

  readonly organizationId: string

  readonly address?: string

  readonly latitude?: number

  readonly longitude?: number

  readonly advantageForm: AdvantageForm[]

  readonly pointOfSaleType: PointOfSaleType[]

  readonly radius?: number
}
