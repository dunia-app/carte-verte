import moment = require('moment')
import { isUndefined } from '../../../../utils/is-undefined.util'
import { TreezorUser } from '../treezor.entity'
import { getUserTypeId, TreezorUserType } from '../treezor.types'

export interface PostUsersInputProps {
  userType: TreezorUserType
  specifiedUSPerson: boolean
  email: string
  title: string
  lastname: string
  firstname: string
  address1: string
  address2?: string
  address3?: string
  postcode: string
  city: string
  country: string
  mobile: string
  birthday: Date
}

export class PutUsersInput<
  Props extends Partial<PostUsersInputProps> = Partial<PostUsersInputProps>,
> {
  constructor(props: Props) {
    this.userTypeId = props.userType ? getUserTypeId(props.userType) : undefined
    this.specifiedUSPerson = !isUndefined(props.specifiedUSPerson)
      ? props.specifiedUSPerson
        ? 1
        : 0
      : undefined
    this.email = props.email
    this.title = props.title
    this.lastname = props.lastname
    this.firstname = props.firstname
    this.address1 = props.address1
    this.address2 = props.address2
    this.address3 = props.address3
    this.postcode = props.postcode
    this.city = props.city
    this.country = props.country
    this.mobile = props.mobile
    this.birthday = moment(props.birthday).format('YYYY-MM-DD')
  }

  readonly userTypeId?: number

  readonly specifiedUSPerson?: number

  readonly email?: string

  readonly title?: string

  readonly lastname?: string

  readonly firstname?: string

  readonly address1?: string

  readonly address2?: string

  readonly address3?: string

  readonly postcode?: string

  readonly city?: string

  readonly country?: string

  readonly mobile?: string

  readonly birthday?: string
}

// TO DO : Props is typed correctly but not class
export class PostUsersInput extends PutUsersInput<PostUsersInputProps> {}

export interface TreezorUsersResponse {
  users: TreezorUser[]
}
