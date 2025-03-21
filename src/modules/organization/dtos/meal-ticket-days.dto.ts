import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean } from 'class-validator';
import { WeekDay } from '../../../libs/ddd/domain/value-objects/weekday.types';

@ObjectType()
@InputType('MealTicketDaysInput')
export class MealTicketDays {
  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on mondays' })
  @IsBoolean()
  [WeekDay.MONDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on tuesdays' })
  @IsBoolean()
  [WeekDay.TUESDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on wednesdays' })
  @IsBoolean()
  [WeekDay.WEDNESDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on thursdays' })
  @IsBoolean()
  [WeekDay.THURSDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on fridays' })
  @IsBoolean()
  [WeekDay.FRIDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on saturdays' })
  @IsBoolean()
  [WeekDay.SATURDAY]!: boolean;

  @Field(() => Boolean, { description: 'Does the employee get a meal ticket on sundays' })
  @IsBoolean()
  [WeekDay.SUNDAY]!: boolean
}
