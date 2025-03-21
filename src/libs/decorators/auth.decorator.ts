import { SetMetadata, UseGuards } from '@nestjs/common'
import { AppAuthGuard } from '../../infrastructure/guards/auth.guard'

export function SkipJWTAuth(): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    SetMetadata('exclude', true)(target, propertyKey!, descriptor)
  }
}

// verify jwt token, fetch and set user in req object
export const AppGuard =
  (...guards: any[]): MethodDecorator & ClassDecorator =>
  (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata('alreadyGuarded', true)(target, propertyKey!, descriptor!)
    UseGuards(...[AppAuthGuard, ...guards])(target, propertyKey!, descriptor!)
  }
