import { Injectable, NestMiddleware } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ConfigService } from '../config/config.service'

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    if (req.method === 'OPTIONS') {
      return next()
    }
    const authHeader = req.headers['authorization']
    try {
      this.configService.authenticateBasic(authHeader)
      next()
    } catch (error) {
      res.setHeader('WWW-Authenticate', 'Basic')
      throw error
    }
  }
}
