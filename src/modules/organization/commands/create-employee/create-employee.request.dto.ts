import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { IsValidDate } from '../../../../libs/decorators/is-valid-date.decorator'
import { noKycMonthlyLimit } from '../../../merchant/domain/entities/advantage.types'
import { MealTicketDays } from '../../dtos/meal-ticket-days.dto'

@ArgsType()
@InputType()
export class CreateEmployeeRequest {
  @Field(() => String, { description: 'email of the employee' })
  @IsEmail()
  readonly email!: string

  @Field(() => String, { description: 'firstname of the employee' })
  @IsString()
  readonly firstname!: string

  @Field(() => String, { description: 'lastname of the employee' })
  @IsString()
  readonly lastname!: string

  @Field(() => Date, { description: 'birthday of the employee' })
  @IsValidDate()
  readonly birthday!: Date

  @Field(() => MealTicketDays, {
    description: 'which days employee is supposed to get a meal ticket',
  })
  @ValidateNested()
  @Type(() => MealTicketDays)
  readonly mealTicketDays!: MealTicketDays

  @Field({ description: 'defaultAuthorizedOverdraft of the employee' })
  @IsNumber()
  @IsNumber()
  @Min(1)
  @Max(noKycMonthlyLimit)
  readonly defaultAuthorizedOverdraft: number

  @Field({ description: 'organization id', nullable: true })
  @IsString()
  readonly organizationId?: string
}
