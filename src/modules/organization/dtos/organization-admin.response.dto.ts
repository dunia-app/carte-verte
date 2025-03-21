import { Field, ObjectType } from '@nestjs/graphql'
import { BaseEntityProps } from '../../../libs/ddd/domain/base-classes/entity.base'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OffsetPaginationResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'

export interface OrganizationAdminLoginResp {
  organizationAdminId: UUID
  refreshToken: string
}

export interface FindOrganizationAdminResponseProps extends BaseEntityProps {
  userId: string
  firstname: string
  lastname: string
  email: string
}

@ObjectType()
export class FindOrganizationAdminResponse extends ResponseBase {
  constructor(props: FindOrganizationAdminResponseProps) {
    super(props)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.userId = props.id.value
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.email = props.email
  }

  @Field(() => String)
  userId: string

  @Field(() => String)
  firstname: string

  @Field(() => String)
  lastname: string

  @Field(() => String)
  email: string
}

export interface FindOrganizationAdminsResponseProps {
  data: FindOrganizationAdminResponseProps[]
  count: number
  limit?: number
}

@ObjectType()
export class FindOrganizationAdminsResponse extends OffsetPaginationResponseBase<FindOrganizationAdminResponse> {
  constructor(props: FindOrganizationAdminsResponseProps) {
    super(props.count, props.limit)
    this.data = props.data.map(
      (aggregate) => new FindOrganizationAdminResponse(aggregate),
    )
  }

  @Field(() => [FindOrganizationAdminResponse])
  data: FindOrganizationAdminResponse[]
}
