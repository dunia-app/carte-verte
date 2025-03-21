import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { logger } from '../../helpers/application.helper'

@Injectable()
export class TimeoutLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    return next.handle().pipe(
      tap(() => {
        const time = Date.now() - now
        if (time > 800) {
          const body = context.switchToHttp().getRequest().body
          logger.log(
            `External validation: ${
              body ? JSON.stringify(body) : 'unknown'
            } took ${time}ms`,
          )
        }
      }),
    )
  }
}
