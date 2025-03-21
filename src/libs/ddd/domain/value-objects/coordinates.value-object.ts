import { ArgumentOutOfRangeException } from '../../../exceptions/index'
import { ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export interface CoordsProps {
  latitude: number
  longitude: number
}

export class Coords extends ValueObject<CoordsProps> {
  get longitude(): number {
    return this.props.longitude
  }

  get latitude(): number {
    return this.props.latitude
  }

  protected validate(props: CoordsProps): void {
    if (!Guard.lengthIsBetween(props.longitude, -180, 180)) {
      throw new ArgumentOutOfRangeException('longitude')
    }
    if (!Guard.lengthIsBetween(props.latitude, -90, 90)) {
      throw new ArgumentOutOfRangeException('latitude')
    }
  }
}
