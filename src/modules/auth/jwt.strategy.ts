import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '../../infrastructure/config/config.service'
import { EmployeeRepository } from '../organization/database/employee/employee.repository'
import { OrganizationAdminRepository } from '../organization/database/organization-admin/organization-admin.repository'
import { SuperAdminRepository } from '../user/database/super-admin/super-admin.repository'
import { UserRepository } from '../user/database/user/user.repository'
import { UserRoles } from '../user/domain/entities/user.types'
import { JwtPayload } from './dto/auth.dto'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ConfigService) readonly configService: ConfigService,
    private readonly employeeRepo: EmployeeRepository,
    private readonly organizationAdminRepo: OrganizationAdminRepository,
    private readonly superAdminRepo: SuperAdminRepository,
    private readonly userRepo: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    })
  }

  async validate(payload: JwtPayload) {
    switch (payload.role) {
      case UserRoles.superAdmin:
        return this.superAdminRepo.findOneByIdOrThrow(payload.id)
      case UserRoles.organizationAdmin:
        return this.organizationAdminRepo.findOneByIdOrThrow(payload.id)
      case UserRoles.employee:
        return this.employeeRepo.findOneByIdOrThrow(payload.id)
      default:
        return this.userRepo.findOneByIdOrThrow(payload.id)
    }
  }
}
