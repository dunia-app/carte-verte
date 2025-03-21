import { ValueObject } from '../../../../libs/ddd/domain/base-classes/value-object.base'

export interface MerchantGradesProps {
  bio: number
  local: number
  vegetarian: number
  antiwaste: number
  nowaste: number
  inclusive: number
  total: number
}

export class MerchantGrades extends ValueObject<MerchantGradesProps> {
  constructor(props: Omit<MerchantGradesProps, 'total'>) {
    super({
      ...props,
      total:
        props.bio +
        props.local +
        props.vegetarian +
        props.antiwaste +
        props.nowaste +
        props.inclusive,
    })
  }
  get bio(): number {
    return this.props.bio
  }

  get local(): number {
    return this.props.local
  }

  get vegetarian(): number {
    return this.props.vegetarian
  }

  get antiwaste(): number {
    return this.props.antiwaste
  }

  get nowaste(): number {
    return this.props.nowaste
  }

  get inclusive(): number {
    return this.props.inclusive
  }

  get total(): number {
    return this.props.total
  }

  protected validate(props: MerchantGradesProps): void {}
}
