import { Field, Float, ObjectType } from '@nestjs/graphql'
import { capitalizeEachWords } from '../../../helpers/string.helper'
import { DateVO } from '../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CursorPaginationResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import {
  AdvantageForm,
  MerchantCategoryNameFilter,
  PointOfSaleGradesType,
  PointOfSaleType,
  getCategoryNameFilterFromMcc,
} from '../domain/entities/merchant.types'

export interface PointOfSaleReponseProps {
  id: UUID
  createdAt: DateVO
  updatedAt: DateVO
  name: string
  mcc?: string
  attribute?: string
  advantageForm?: AdvantageForm
  pointOfSaleType?: PointOfSaleType
  description?: string
  phone?: string
  city?: string
  postalCode?: string
  street?: string
  email?: string
  website?: string
  tags: PointOfSaleGradesType[]
  imageLinks: string[]
  distance: number
  labelName: string
  labelLink: string
  reviewLink: string
  latitude?: number
  longitude?: number
  filterCode?: string
  filterName?: string
}

@ObjectType()
class AdvantageResponse {
  @Field(() => AdvantageForm)
  form!: AdvantageForm

  @Field(() => Float, { nullable: true })
  value?: number
}

@ObjectType()
export class PointOfSaleResponse extends ResponseBase {
  constructor(props: PointOfSaleReponseProps) {
    super(props)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.name = capitalizeEachWords(props.name)
    this.mcc = props.mcc
    // TO BE DELETED
    this.categoryName = props.mcc
      ? getCategoryNameFilterFromMcc(props.mcc)
      : MerchantCategoryNameFilter.OTHER
    this.filterName = props.filterName
    this.attribute = props.attribute
    this.advantage =
      props.advantageForm && !props.filterCode?.startsWith('NONE')
        ? {
            form: props.advantageForm,
            value: undefined,
          }
        : undefined
    this.pointOfSaleType = props.pointOfSaleType
    this.description = props.description
    this.phone = props.phone
    this.city = props.city
    this.postalCode = props.postalCode
    this.street = props.street
    this.email = props.email
    this.website = props.website
    this.tags = props.tags
    this.imageLinks = props.imageLinks
      ? props.imageLinks.length > 1
        ? getSeededRandomImgLink(props.id, props.imageLinks)
        : props.imageLinks
      : []
    this.distance =
      props.pointOfSaleType === PointOfSaleType.PHYSICAL
        ? props.distance
        : undefined
    this.labelName = props.labelName
    this.labelLink = props.labelLink
    this.reviewLink = props.reviewLink
    this.latitude = props.latitude
    this.longitude = props.longitude
  }

  // TO DO : field to populate
  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  mcc?: string

  // TO BE DELETED
  @Field(() => String, { nullable: true, deprecationReason: 'Use filterName instead' })
  categoryName?: string

  @Field(() => String, { nullable: true })
  filterName?: string

  @Field(() => String, { nullable: true })
  attribute?: string

  @Field(() => AdvantageResponse, { nullable: true })
  advantage?: AdvantageResponse

  @Field(() => PointOfSaleType, { nullable: true })
  pointOfSaleType?: PointOfSaleType

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  phone?: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => String, { nullable: true })
  postalCode?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => String, { nullable: true })
  email?: string

  @Field(() => String, { nullable: true })
  website?: string

  @Field(() => [PointOfSaleGradesType])
  tags: PointOfSaleGradesType[]

  @Field(() => [String])
  imageLinks: string[]

  @Field(() => Float, { nullable: true })
  distance?: number

  @Field(() => String, { nullable: true })
  labelName: string

  @Field(() => String, { nullable: true })
  labelLink: string

  @Field(() => String, { nullable: true })
  reviewLink: string

  @Field(() => Float, { nullable: true })
  latitude?: number

  @Field(() => Float, { nullable: true })
  longitude?: number
}

@ObjectType()
export class PointOfSalesResponse extends CursorPaginationResponseBase<PointOfSaleResponse> {
  @Field((_Type) => [PointOfSaleResponse], { nullable: true })
  data!: PointOfSaleResponse[]
}

function getSeededRandomImgLink(id: UUID, imgLinks: string[]) {
  if (imgLinks.length <= 1) {
    return imgLinks
  }
  return [
    imgLinks[
      Number((id.value.match(new RegExp('[0-9][0-9]')) || [1])[0]) %
        imgLinks.length
    ],
  ]
}
