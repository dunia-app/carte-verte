import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common'

import { Reflector } from '@nestjs/core'
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport'
import _ from 'lodash'
import { ExtractJwt } from 'passport-jwt'

import { getRequest } from '../../helpers/application.helper'

import { FastifyRequest } from 'fastify'
import { isProductionEnv } from '../../helpers/is_env'
import { AuthService } from '../../modules/auth/auth.service'
import { ConfigService } from '../config/config.service'

// AuthGuard of nestjs/passport
// checks if a valid user exists and populates it
// does a db call
@Injectable()
export class AppAuthGuard extends AuthGuard('jwt') {
  superCanActivate: any
  constructor(@Optional() protected readonly options?: AuthModuleOptions) {
    super(options)
    this.superCanActivate = super.canActivate
  }
  getRequest(context: ExecutionContext) {
    if ((context.getType() as any) !== 'graphql') {
      const request = context.switchToHttp().getRequest() as FastifyRequest
      return request
    }
    const res = getRequest(context)
    return res
  }
}

export const extractFunction = ExtractJwt.fromAuthHeaderAsBearerToken()

// only checks if jwt is still valid and was not tempered
// doesn't do any db call and does not check for a valid user
// used as a global guard
@Injectable()
export class GuardValidJWT implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}
  canActivate(context: ExecutionContext) {
    const handler = context.getHandler()

    const alreadyGuarded = this.reflector.get<boolean>(
      'alreadyGuarded',
      handler,
    )
    if (alreadyGuarded) return true
    let exclude = this.reflector.get<string[]>('exclude', handler)
    if (!exclude) {
      exclude = this.reflector.get('exclude', context.getClass())
    }
    if (exclude) {
      return true
    }

    const req = getRequest(context)
    if (!isProductionEnv) {
      const skipAuthToken = this.configService.get('SKIP_AUTH_PWD')
      if (skipAuthToken && req.headers['skip-auth'] === skipAuthToken) {
        return true
      }
    }

    try {
      const token = extractFunction(req as any)
      if (!token) {
        throw new Error('missing jwt')
      }
      const jwt = this.authService.verifyJWT(token)
      if (!jwt) {
        throw new Error('missing jwt')
      }
      if (!req.user) req.user = {} as any
      req.user = _.merge(req.user, jwt)
      req.deviceId = jwt.deviceId
      req.email = jwt.email
    } catch (e: any) {
      throw new UnauthorizedException(e?.message)
    }
    return true
  }
}
