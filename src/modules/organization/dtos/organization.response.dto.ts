import { Field, Float, Int, ObjectType } from '@nestjs/graphql'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import { OrganizationEntity } from '../domain/entities/organization.entity'
import { OrganizationStatus } from '../domain/entities/organization.types'
import { CommissionType } from '../domain/value-objects/organization-offer.value-object'

@ObjectType()
export class OrganizationPayrollIntegrationResponseProps {
  @Field()
  provider!: string

  @Field()
  active!: boolean

  @Field()
  oAuthUrl!: string
}

@ObjectType()
export class CreateOrganizationPayrollIntegrationResponse {
  @Field()
  employeesCreatedCount!: number

  @Field()
  employeesUpdatedCount!: number

  @Field()
  employeesNotFoundCount!: number
}

@ObjectType()
export class FindOrganizationPayrollIntegrationsResponse {
  constructor(props: OrganizationPayrollIntegrationResponseProps[]) {
    this.data = props
  }

  @Field(() => [OrganizationPayrollIntegrationResponseProps])
  data: OrganizationPayrollIntegrationResponseProps[]
}

@ObjectType()
export class OfferResponse {
  @Field(() => Float)
  commission!: number

  @Field(() => CommissionType)
  commissionType!: CommissionType

  @Field(() => Float)
  advantageInShops!: number

  @Field(() => Float)
  physicalCardPrice!: number

  @Field(() => Float)
  firstPhysicalCardPrice!: number
}

@ObjectType()
export class MealTicketConfigResponse {
  @Field(() => Float, { nullable: true })
  coveragePercent?: number

  @Field(() => Float, { nullable: true })
  mealTicketAmount?: number

  @Field(() => Int, { nullable: true })
  mealTicketDay?: number

  @Field(() => Boolean, { nullable: true })
  mealTicketAutoRenew?: boolean

  @Field(() => Float, { nullable: true })
  physicalCardCoverage?: number

  @Field(() => Float, { nullable: true })
  firstPhysicalCardCoverage?: number
}

@ObjectType()
export class OrganizationInfoResponse extends ResponseBase {
  constructor(props: OrganizationEntity) {
    super(props)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.status = props.status
    this.offer = props.offer
    this.mealTicketConfig = props.settings
    this.name = props.name
    this.city = props.address?.city
    this.postalCode = props.address?.postalCode
    this.street = props.address?.street
    this.siret = props.siret
    this.iban = props.iban?.masked
  }

  @Field(() => OrganizationStatus)
  status: OrganizationStatus

  @Field(() => OfferResponse)
  offer: OfferResponse

  @Field(() => MealTicketConfigResponse, { nullable: true })
  mealTicketConfig?: MealTicketConfigResponse

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => String, { nullable: true })
  postalCode?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => String, { nullable: true })
  siret?: string

  @Field(() => String, { nullable: true })
  iban?: string
}

@ObjectType()
export class FindAccessibleOrganizationsResponse {
  constructor(props: OrganizationEntity[]) {
    this.data = props.map(
      (aggregate) => new OrganizationInfoResponse(aggregate),
    )
  }

  @Field(() => [OrganizationInfoResponse])
  data: OrganizationInfoResponse[]
}
