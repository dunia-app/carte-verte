import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator'

@InputType()
export class CursorPaginationBase {
  @Field((_type) => Int, {
    nullable: true,
    defaultValue: 20,
    description: 'How many transaction you want to get. Default 20, max 500',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit!: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string
}

@ObjectType()
export abstract class CursorPaginationResponseBase<T> {
  constructor(
    count: number,
    before: string | undefined,
    after: string | undefined,
  ) {
    this.count = count
    this.before = before
    this.after = after
  }
  abstract data: T[]

  @Field(() => Int)
  count: number

  @Field(() => String, { nullable: true })
  before?: string

  @Field(() => String, { nullable: true })
  after?: string
}

@InputType()
export class OffsetPaginationBase {
  @Field((_type) => Int, {
    nullable: true,
    defaultValue: 20,
    description: 'How many transaction you want to get. Default 20, max 500',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit!: number

  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: 'How many transaction you want to skip. Default 0',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number
}

@ObjectType()
export abstract class OffsetPaginationResponseBase<T> {
  constructor(count: number, limit: number | undefined) {
    this.count = count
    this.limit = limit
  }
  abstract data: T[]

  @Field(() => Int)
  count: number

  @Field(() => Int, { nullable: true })
  limit?: number
}
