import { ExceptionBase } from '../../../libs/exceptions/index'

export class PlaceNotFoundError extends ExceptionBase {
  static readonly message = 'No places found for this entry'

  public readonly code: string = 'PLACE.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(PlaceNotFoundError.message, metadata)
  }
}
