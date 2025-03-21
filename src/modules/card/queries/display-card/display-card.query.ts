import {
  Query,
  QueryProps,
} from '../../../../libs/ddd/domain/base-classes/query.base'
import {
  CardNotFoundError,
  CardNotUnlockedError,
} from '../../errors/card.errors'

// Query is a plain object with properties
export class DisplayCardQuery extends Query<
  string,
  CardNotUnlockedError | CardNotFoundError
> {
  constructor(props: QueryProps<DisplayCardQuery>) {
    super(props)
    this.employeeId = props.employeeId
    this.emptyCardDesign = props.emptyCardDesign
    this.newVersion = props.newVersion
  }

  readonly employeeId: string

  readonly emptyCardDesign: boolean

  readonly newVersion: boolean
}
