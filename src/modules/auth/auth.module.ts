import { Module, forwardRef } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigService } from '../../infrastructure/config/config.service'
import { GuardValidJWT } from '../../infrastructure/guards/auth.guard'
import { SentryInterceptor } from '../../infrastructure/interceptors/sentry.interceptor'
import { OrganizationModule } from '../organization/organization.module'
import { UserModule } from '../user/user.module'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

// TO DO add auth resolver
const graphqlResolvers: any = []

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => OrganizationModule),
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    ...graphqlResolvers,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: GuardValidJWT,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    }
  ],
  exports: [AuthService],
})
export class AuthModule {
  constructor() {}
}
