import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  getRequest,
  getResponse
} from '../../helpers/application.helper';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  async getTracker(req: Record<string, any>) {
    return req.ip;
  }
  getRequestResponse(context: ExecutionContext) {
    return { req: getRequest(context), res: getResponse(context, false) }
  }
}