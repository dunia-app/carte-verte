import { applyDecorators } from '@nestjs/common'
import {
  Mutation,
  MutationOptions,
  Query,
  QueryOptions,
  ReturnTypeFunc,
} from '@nestjs/graphql'
import { isProductionEnv } from '../../helpers/is_env'
import { RoleGuard } from '../../infrastructure/guards/role.guard'
import { UserRoles } from '../../modules/user/domain/entities/user.types'
import { SkipJWTAuth } from './auth.decorator'

/**
 * Decorator for graphql query that applies role guard or skipJwt automatically.
 * Use this one instead of graphql one.
 * @param roleOrSkipAuth either role that is authorized or false for skipJwtAuth
 */
export function AppQuery(
  nameOrTypeFunc: string | ReturnTypeFunc,
  roleOrSkipAuth: UserRoles | false,
  options?: QueryOptions,
) {
  const authDecorator =
    roleOrSkipAuth === false ? SkipJWTAuth() : RoleGuard(roleOrSkipAuth)
  const queryDecorator =
    typeof nameOrTypeFunc === 'string'
      ? Query(nameOrTypeFunc)
      : Query(nameOrTypeFunc, options)

  return applyDecorators(authDecorator, queryDecorator)
}

/**
 * Decorator for graphql mutation that applies role guard or skipJwt automatically.
 * Use this one instead of graphql one.
 * @param nameOrTypeFunc return type, make sure you extends function ErrorWithResponse
 * @param roleOrSkipAuth either role that is authorized or false for skipJwtAuth
 */
export function AppMutation(
  nameOrTypeFunc: string | ReturnTypeFunc,
  roleOrSkipAuth: UserRoles | false,
  options?: MutationOptions,
) {
  const authDecorator =
    roleOrSkipAuth === false ? SkipJWTAuth() : RoleGuard(roleOrSkipAuth)
  const queryDecorator =
    typeof nameOrTypeFunc === 'string'
      ? Mutation(nameOrTypeFunc)
      : Mutation(nameOrTypeFunc, options)

  return applyDecorators(authDecorator, queryDecorator)
}

/**
 * Decorator for dev graphql query that applies role guard or skipJwt automatically.
 * This query is only used in development.
 * @param roleOrSkipAuth either role that is authorized or false for skipJwtAuth
 */
export function AppQueryDev(
  nameOrTypeFunc: string | ReturnTypeFunc,
  roleOrSkipAuth: UserRoles | false,
  options?: QueryOptions,
) {
  const authDecorator =
    roleOrSkipAuth === false ? SkipJWTAuth() : RoleGuard(roleOrSkipAuth)

  return applyDecorators(authDecorator, QueryDev(nameOrTypeFunc, options))
}

/**
 * Decorator for dev graphql mutation that applies role guard or skipJwt automatically.
 * This mutation is only used in development.
 * @param roleOrSkipAuth either role that is authorized or false for skipJwtAuth
 */
export function AppMutationDev(
  nameOrTypeFunc: string | ReturnTypeFunc,
  roleOrSkipAuth: UserRoles | false,
  options?: MutationOptions,
) {
  const authDecorator =
    roleOrSkipAuth === false ? SkipJWTAuth() : RoleGuard(roleOrSkipAuth)

  return applyDecorators(authDecorator, MutationDev(nameOrTypeFunc, options))
}

function QueryDev(
  nameOrTypeFunc: string | ReturnTypeFunc,
  options?: QueryOptions,
) {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (!process.env.WITH_GQL_DEBUG && isProductionEnv) return
    if (typeof nameOrTypeFunc === 'string') {
      Query(nameOrTypeFunc)(target, propertyKey, descriptor)
    } else {
      Query(nameOrTypeFunc, {
        description: 'This query is only used in development',
        ...options,
      })(target, propertyKey, descriptor)
    }
  }
}

function MutationDev(
  nameOrTypeFunc: string | ReturnTypeFunc,
  options?: MutationOptions,
) {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (!process.env.WITH_GQL_DEBUG && isProductionEnv) return

    if (typeof nameOrTypeFunc === 'string') {
      Mutation(nameOrTypeFunc)(target, propertyKey, descriptor)
    } else {
      Mutation(nameOrTypeFunc, {
        description: 'This mutation is only used in development',
        ...options,
      })(target, propertyKey, descriptor)
    }
  }
}
