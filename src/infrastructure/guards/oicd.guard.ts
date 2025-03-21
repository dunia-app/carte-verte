import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../helpers/application.helper';

@Injectable()
export class OidcGuard extends AuthGuard('oauth2') implements CanActivate {
  private readonly client: OAuth2Client;

  constructor(private readonly route: string) {
    super();
    this.client = new OAuth2Client();
    this.route = route;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    logger.info(`Authorization header : ${request.headers['authorization']}`)

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException(`Missing Authorization header : ${authHeader}`);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(`Invalid Authorization header : ${authHeader}`);
    }

    if(!process.env.APP_URL) {
      throw new UnauthorizedException('APP_URL not found');
    }

    const audience = `${process.env.APP_URL}/${this.route}`

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: audience,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException(`Invalid token payload : ${authHeader}`);
      }

      return true;
    } catch (error) {
      logger.error(`Invalid OIDC token : ${authHeader}`);
      throw new UnauthorizedException(`Invalid OIDC token : ${authHeader}`);
    }
  }
}
