import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import DataLoader from 'dataloader'
import { Observable } from 'rxjs'
import { IOrderedNestDataLoaderOptions } from './dataloader.class'
import { NEST_LOADER_CONTEXT_KEY } from './dataloader.constants'

export interface NestDataLoader<Type> {
  generateDataLoader(options?: any): DataLoader<string, Type>
}

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const ctx = GqlExecutionContext.create(context).getContext()
    if (!ctx) return next.handle()

    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = {
        getLoader: (
          type: string,
          options = {} as IOrderedNestDataLoaderOptions<any>,
        ): Promise<NestDataLoader<any>> => {
          const key = type + `:${JSON.stringify(options)}`
          if (ctx[key] === undefined) {
            try {
              const typeLoader = this.moduleRef.get<NestDataLoader<any>>(type, {
                strict: false,
              })

              ctx[key] = typeLoader.generateDataLoader(options)
            } catch (e) {
              throw new InternalServerErrorException(
                `The loader ${type} is not provided` + e,
              )
            }
          }
          return ctx[key]
        },
      }
    }
    return next.handle()
  }
}
