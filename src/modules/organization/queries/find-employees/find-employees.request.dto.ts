import { ArgsType, Field, InputType } from '@nestjs/graphql'
import { IsArray, IsOptional, IsString } from 'class-validator'

@ArgsType()
@InputType()
export class FindEmployeesRequest {
  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly searchTerms?: string[]
}
