import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ServerResponse } from 'http';
import { UUID } from '../../libs/ddd/domain/value-objects/uuid.value-object';
import { UserRoles } from '../user/domain/entities/user.types';
import { JwtPayload } from './dto/auth.dto';

const cryptoRandomString = require('crypto-random-string');

@Injectable()
export class AuthService {
  constructor(protected readonly jwtService: JwtService) {}

  createToken() {
    return cryptoRandomString({ length: 16, type: 'url-safe' })
  }

  createJWT(userId: UUID, role: UserRoles, deviceId?: string, userEmail?: string): string {
    const userPL: JwtPayload = {
      id: userId.value,
      role: role,
      deviceId: deviceId,
      email: userEmail
    }
    const opt: JwtSignOptions = {}
    if (role === UserRoles.superAdmin || role === UserRoles.organizationAdmin) {
      opt.expiresIn = '2h'
    }
    return this.jwtService.sign(userPL, opt)
  }

  verifyJWT(token: string) {
    return this.jwtService.verify(token)
  }

  verifyExpiredJWT(token: string): JwtPayload | null {
    return this.jwtService.verify(token, {
      ignoreExpiration: true,
    }) as JwtPayload | null
  }

  setAuthHeaders(res: ServerResponse, jwt: string, refreshToken: string) {
    res.setHeader('jwt', jwt)
    res.setHeader('refreshToken', refreshToken)
  }

  setJwtHeader(res: ServerResponse, jwt: string) {
    res.setHeader('jwt', jwt)
  }
}
