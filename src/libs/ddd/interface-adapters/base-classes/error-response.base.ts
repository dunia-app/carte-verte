import { Type } from '@nestjs/common'
import {
  createUnionType,
  Field,
  InterfaceType,
  ObjectType,
} from '@nestjs/graphql'
import { GraphQLScalarType } from 'graphql'
import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../../domain/utils/result.util'

type GqlTypeReference<T> =
  | Type<T>
  | GraphQLScalarType
  | Function
  | object
  | symbol
type ReturnTypeFuncValue<T> = GqlTypeReference<T> | [GqlTypeReference<T>]

@ObjectType()
class ErrorTraduction {
  @Field(() => String)
  title!: string

  @Field(() => String)
  message!: string
}
/** Interface to convert our domain ExceptionBase errors into graphql ones */
@InterfaceType()
class BaseGraphqlError<K extends ExceptionBase = ExceptionBase>
  implements Partial<ExceptionBase>
{
  constructor(exception: K) {
    this.code = exception.code
    this.message = exception.message
    this.metadata = exception.metadata ? String(exception.metadata) : undefined
    this.child = exception.childErrors?.map(
      (child) => new BaseGraphqlError(child),
    )
  }

  @Field(() => String)
  readonly message: string

  @Field(() => String)
  readonly code: string

  @Field(() => ErrorTraduction, { nullable: true })
  readonly traduction?: ErrorTraduction

  @Field(() => [UnknownGraphqlError], { nullable: true })
  readonly child?: UnknownGraphqlError[]

  @Field({ nullable: true })
  readonly metadata?: string
}

// Generic type that we need for typing field errors
@ObjectType({
  implements: () => [BaseGraphqlError],
})
class UnknownGraphqlError extends BaseGraphqlError<ExceptionBase> {}

// We keep track of created class to avoid creating same class twice
const alreadyCreatedErrorTypes: Map<string, Type<any>> = new Map()

/***
 * Helper for correctly typed resolver return class with possible error added
 *
 * @param errorTypeClasses array of all possible error (must extend ExceptionBase and be in an .errors file)
 * @param errorTypeName name of the union of possible error (for graphql documentation)
 * @param resultTypeClass class of the returning type of the resolver
 *
 * @returns class with graphql decorator and error correctly typed
 */
export function ErrorWithResponse<
  ResultType,
  ET1 extends ExceptionBase = ExceptionBase,
  ET2 extends ExceptionBase = never,
  ET3 extends ExceptionBase = never,
  ET4 extends ExceptionBase = never,
  ET5 extends ExceptionBase = never,
  ET6 extends ExceptionBase = never,
  ET7 extends ExceptionBase = never,
  ET8 extends ExceptionBase = never,
  ET9 extends ExceptionBase = never,
>(
  errorTypeClasses: [
    Type<ET1>?,
    Type<ET2>?,
    Type<ET3>?,
    Type<ET4>?,
    Type<ET5>?,
    Type<ET6>?,
    Type<ET7>?,
    Type<ET8>?,
    Type<ET9>?,
  ],
  errorTypeName: string,
  resultTypeClass: ReturnTypeFuncValue<ResultType>,
) {
  // We create a class for each error type
  const errorGraphqlTypes = errorTypeClasses.map((errorTypeClasse) => {
    // We need to avoid creating same class twice
    const existingClass = alreadyCreatedErrorTypes.get(errorTypeClasse!.name)
    if (existingClass) {
      return existingClass
    }
    @ObjectType(errorTypeClasse!.name, {
      implements: () => [BaseGraphqlError],
    })
    class errorGraphqlType extends BaseGraphqlError {}

    alreadyCreatedErrorTypes.set(errorTypeClasse!.name, errorGraphqlType)

    return errorGraphqlType
  })

  // Graphql union of all errors possible (for graphql documentation)
  const ResultUnion = createUnionType({
    name: errorTypeName,
    types: () => [...errorGraphqlTypes, UnknownGraphqlError] as const,
  })

  // Base response class with error and data (named according to parameter)
  @ObjectType({ isAbstract: true })
  class BaseErrorResponseClass {
    constructor(
      result: Result<
        ResultType | ResultType[],
        Exclude<ET1 | ET2 | ET3 | ET4 | ET5 | ET6 | ET7 | ET8 | ET9, never>
      >,
    ) {
      if (result.isOk) {
        this.result = result.value
      } else {
        this.error = new UnknownGraphqlError(result.error)
      }
    }
    @Field(() => resultTypeClass, {
      nullable: true,
    })
    result?: ResultType | ResultType[]

    @Field(() => ResultUnion, { nullable: true })
    error?: UnknownGraphqlError
  }
  return BaseErrorResponseClass
}

export type ResolverResponseClass<T, K> = {
  result?: T
  error?: K
}
