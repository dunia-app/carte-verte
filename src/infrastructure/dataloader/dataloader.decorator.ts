import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { IOrderedNestDataLoaderOptions, LoaderType } from './dataloader.class'
import { NEST_LOADER_CONTEXT_KEY } from './dataloader.constants'

export type LoaderOptions = {
  name: string | Function
  options: Partial<IOrderedNestDataLoaderOptions<any>>
}

function getNameFromStringOrFunction(data: string | Function) {
  return typeof data === 'string' ? data : data?.name
}

function getNameAndOptions(
  data: Function | LoaderOptions,
): [string, IOrderedNestDataLoaderOptions<any>] {
  let name
  let options = {}
  switch (typeof data) {
    case 'string':
    case 'function':
      name = getNameFromStringOrFunction(data)
      break
    case 'object':
      name = getNameFromStringOrFunction(data.name)
      options = { ...data?.options }
      break
  }
  return [name, options]
}

export const Loader = createParamDecorator(
  (data: Function | LoaderOptions, context: ExecutionContext) => {
    const [name, options] = getNameAndOptions(data)
    if (!name) {
      throw new InternalServerErrorException(
        `Invalid name provider to @Loader ('${name}')`,
      )
    }

    const ctx = GqlExecutionContext.create(context).getContext()
    return ctx[NEST_LOADER_CONTEXT_KEY].getLoader(name, options)
  },
)

export type FromOwnerLoaderType<
  T = any,
  K extends string = 'ownerId',
> = LoaderType<
  {
    results: T[]
  } & { [key in K]: string }
>
export const LoaderFromOwner = createParamDecorator(
  (data: Function | LoaderOptions, context: ExecutionContext) => {
    const [name, passedOptions] = getNameAndOptions(data)
    const ownerIdKey = passedOptions?.propertyKey || 'ownerId'
    let options = {
      queryName: 'fromOwner',
      propertyKey: ownerIdKey,
      ...passedOptions,
      queryOptions: {
        ownerIdKey,
        ...passedOptions.queryOptions,
      },
    }
    if (!name) {
      throw new InternalServerErrorException(
        `Invalid name provider to @Loader ('${name}')`,
      )
    }

    const ctx = GqlExecutionContext.create(context).getContext()
    return ctx[NEST_LOADER_CONTEXT_KEY].getLoader(name, options)
  },
)
