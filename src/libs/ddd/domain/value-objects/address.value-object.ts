import { ArgumentOutOfRangeException } from '../../../exceptions/index'
import { ValueObject } from '../base-classes/value-object.base'
import { Guard } from '../guard'

export interface AddressProps {
  city: string
  postalCode?: string
  street?: string
  country?: string
  longitude?: number
  latitude?: number
}

export class Address extends ValueObject<AddressProps> {
  get city(): string {
    return this.props.city.trim()
  }

  get postalCode(): string | undefined {
    return this.props.postalCode ? this.props.postalCode.trim() : undefined
  }

  get street(): string | undefined {
    return this.props.street ? this.props.street.trim() : undefined
  }

  get country(): string | undefined {
    return this.props.country ? this.props.country.trim() : undefined
  }

  get longitude(): number | undefined {
    return this.props.longitude
  }

  get latitude(): number | undefined {
    return this.props.latitude
  }

  get formattedAddress(): string {
    return `${this.street} ${this.postalCode} ${this.city}`
  }

  protected validate(props: AddressProps): void {
    if (!Guard.lengthIsBetween(props.city, 2, 50)) {
      throw new ArgumentOutOfRangeException('city')
    }
    if (props.street && !Guard.lengthIsBetween(props.street, 1, 100)) {
      throw new ArgumentOutOfRangeException('street')
    }
    if (props.postalCode && !Guard.lengthIsBetween(props.postalCode, 2, 10)) {
      throw new ArgumentOutOfRangeException('postalCode')
    }
  }
}
