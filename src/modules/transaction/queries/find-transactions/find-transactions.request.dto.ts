import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { Type } from 'class-transformer'
import { IsDate, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { CursorPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { TransactionStatus } from '../../domain/entities/transaction.types'

@ArgsType()
@InputType()
export class FindTransactionsRequest {
  @Field(() => CursorPaginationBase)
  @ValidateNested()
  @Type(() => CursorPaginationBase)
  readonly pagination!: CursorPaginationBase

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  readonly startDate?: Date

  @Field(() => TransactionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus
}
