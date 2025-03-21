import { ArgsType, Field, Float, InputType, ObjectType } from '@nestjs/graphql'
import { IsString } from 'class-validator'
import { capitalize } from '../../../helpers/string.helper'
import { BaseEntityProps } from '../../../libs/ddd/domain/base-classes/entity.base'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OffsetPaginationResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { ResponseBase } from '../../../libs/ddd/interface-adapters/base-classes/response.base'
import { DateWithoutTimeScalar } from '../../../libs/types/date-without-time.scalar'
import { EmployeeStatus } from '../domain/entities/employee.types'
import { BooleanByWeekday } from '../domain/value-objects/boolean-by-weekday.value-object'
import { MealTicketDays } from './meal-ticket-days.dto'

export interface EmployeeLoginResp {
  employeeId: UUID
  refreshToken: string
}

@ArgsType()
@InputType()
export class RefreshTokenRequest {
  @Field(() => String)
  @IsString()
  readonly expiredJwt!: string

  @Field(() => String)
  @IsString()
  readonly refreshToken!: string
}

export interface FindEmployeeResponseProps extends BaseEntityProps {
  userId: string
  firstname: string
  lastname: string
  email: string
  city?: string
  postalCode?: string
  street?: string
  birthday: string
  mealTicketDays: BooleanByWeekday
  coveragePercent?: number
  mealTicketAmount?: number
  status: EmployeeStatus
}

@ObjectType()
export class FindEmployeeResponse extends ResponseBase {
  constructor(props: FindEmployeeResponseProps) {
    super(props)
    /* Whitelisting returned data to avoid leaks.
       If a new property is added, like password or a
       credit card number, it won't be returned
       unless you specifically allow this.
       (avoid blacklisting, which will return everything
        but blacklisted items, which can lead to a data leak).
    */
    this.userId = props.id.value
    this.firstname = capitalize(props.firstname)
    this.lastname =
      props.lastname === 'Carteverte' ? '' : capitalize(props.lastname)
    this.email = props.email
    this.city = props.city
    this.postalCode = props.postalCode
    this.street = props.street
    this.birthday = props.birthday
    this.mealTicketDays = props.mealTicketDays
    this.coveragePercent = props.coveragePercent
    this.mealTicketAmount = props.mealTicketAmount
    this.status = props.status
  }

  @Field(() => String)
  userId: string

  @Field(() => String)
  firstname: string

  @Field(() => String)
  lastname: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  city?: string

  @Field(() => String, { nullable: true })
  postalCode?: string

  @Field(() => String, { nullable: true })
  street?: string

  @Field(() => DateWithoutTimeScalar)
  birthday: string

  @Field(() => MealTicketDays, {
    description: 'which days employee is supposed to get a meal ticket',
  })
  mealTicketDays: MealTicketDays

  @Field(() => Float, { nullable: true })
  coveragePercent?: number

  @Field(() => Float, { nullable: true })
  mealTicketAmount?: number

  @Field(() => EmployeeStatus)
  status: EmployeeStatus
}

export interface FindEmployeesResponseProps {
  data: FindEmployeeResponseProps[]
  count: number
  limit?: number
}

@ObjectType()
export class FindEmployeesResponse extends OffsetPaginationResponseBase<FindEmployeeResponse> {
  constructor(props: FindEmployeesResponseProps) {
    super(props.count, props.limit)
    this.data = props.data.map(
      (aggregate) => new FindEmployeeResponse(aggregate),
    )
  }

  @Field(() => [FindEmployeeResponse])
  data: FindEmployeeResponse[]
}

export class EmployeeDeviceValidationResponseProps {
  phoneNumber?: string
  email?: string
}

@ObjectType()
export class EmployeeDeviceValidationResponse {
  constructor(props: EmployeeDeviceValidationResponseProps) {
    // display phone number as +336******19
    // Keep only the first 4 and the last 2 digits
    this.phoneNumber = props.phoneNumber
      ? props.phoneNumber.substring(0, 4) +
        props.phoneNumber
          .substring(4, props.phoneNumber.length - 2)
          .replace(/[0-9]/g, '*') +
        props.phoneNumber.substring(
          props.phoneNumber.length - 2,
          props.phoneNumber.length,
        )
      : undefined
    // and email as benja****@*****.app
    // Keep only the first 5 and the last 4 digits
    this.email = props.email
      ? props.email.substring(0, 5) +
        props.email
          .substring(5, props.email.length - 4)
          .replace(/[a-z0-9+]/g, '*') +
        props.email.substring(props.email.length - 4, props.email.length)
      : undefined
  }

  @Field(() => String, { nullable: true })
  phoneNumber?: string

  @Field(() => String, { nullable: true })
  email?: string
}
