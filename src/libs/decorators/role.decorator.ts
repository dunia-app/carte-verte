import { SetMetadata } from '@nestjs/common'

export function SkipOrganizationIdCheck(): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    SetMetadata('excludeOrganizationId', true)(target, propertyKey!, descriptor)
  }
}
