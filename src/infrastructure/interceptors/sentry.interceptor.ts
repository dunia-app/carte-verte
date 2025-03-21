import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { getRequest, logger } from "../../helpers/application.helper";
import { AuthService } from "../../modules/auth/auth.service";
import { extractFunction } from "../guards/auth.guard";
const Sentry = require('@sentry/node')

@Injectable()
export class SentryInterceptor implements NestInterceptor{
    constructor(private readonly authService : AuthService){}

    intercept(
        context: ExecutionContext, 
        next: CallHandler,
    ): Observable<any> {
        const request = getRequest(context)
       
        try{
            const token = extractFunction(request as any)
            if (!token) {
              throw new Error('missing jwt')
            }
            const jwtPayload = this.authService.verifyJWT(token)

            if(jwtPayload){
                Sentry.setUser({ email: jwtPayload.email });
                logger.log(`Set user ${jwtPayload.email}`)
            }
        }catch(e){
            logger.warn(`Could not extract user for sentry : ${e}`)
        }

        const now = Date.now();
        return next
          .handle()
          .pipe(
            tap(() => console.log(`After... ${Date.now() - now}ms`)),
          );
      }
}