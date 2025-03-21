import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ConfigService } from '../config/config.service'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context)
    const request = gqlContext.getContext().req

    const authHeader = request.headers['authorization']
    this.configService.authenticateBasic(authHeader)
    return true
  }
}
