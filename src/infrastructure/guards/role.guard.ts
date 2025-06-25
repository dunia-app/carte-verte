import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExtractJwt } from 'passport-jwt'
import { getClientIp } from 'request-ip'
import { getRequest, logger } from '../../helpers/application.helper'
import { decodeJWT } from '../../helpers/string.helper'
import { UUID } from '../../libs/ddd/domain/value-objects/uuid.value-object'
import { JwtPayload } from '../../modules/auth/dto/auth.dto'
import { EmployeeEntity } from '../../modules/organization/domain/entities/employee.entity'
import { OrganizationAdminEntity } from '../../modules/organization/domain/entities/organization-admin.entity'
import { SuperAdminEntity } from '../../modules/user/domain/entities/super-admin.entity'
import { UserEntity } from '../../modules/user/domain/entities/user.entity'
import { UserRoles } from '../../modules/user/domain/entities/user.types'
import { IpAddress } from '../../modules/user/domain/value-objects/ip-address.value-object'
import { UnitOfWork } from '../database/unit-of-work/unit-of-work'
import { AppAuthGuard } from './auth.guard'
const cryptoRandomString = require('crypto-random-string')
import _ = require('lodash')

export function RoleGuard(role: UserRoles): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    SetMetadata('role', role)(target, propertyKey!, descriptor)
    SetMetadata('alreadyGuarded', true)(target, propertyKey!, descriptor)

    UseGuards(AppAuthGuard, GuardRole)(target, propertyKey!, descriptor)
  }
}

const extractFunction = ExtractJwt.fromAuthHeaderAsBearerToken()

@Injectable()
class GuardRole implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async canActivate(context: ExecutionContext) {
    const correlationId = cryptoRandomString({ length: 8 })
    const handler = context.getHandler()
    const req = getRequest(context)
    let role = this.reflector.get<UserRoles>('role', handler)

    if (!role) {
      // get permissions at resolver class level
      role = this.reflector.get('role', context.getClass())
    }
    if (!role) return true

    let excludeOrganizationId = this.reflector.get<string[]>(
      'excludeOrganizationId',
      handler,
    )
    if (!excludeOrganizationId) {
      excludeOrganizationId = this.reflector.get(
        'excludeOrganizationId',
        context.getClass(),
      )
    }

    const user = req.user
    if (!user) {
      logger.warn(
        `[${this.constructor.name}]:warning : userId not found in req.user.id`,
      )
      return false
    }

    // Add ip to list of ip for compliance
    this.unitOfWork.execute(correlationId, async () => {
      const userRepo = this.unitOfWork.getUserRepository(correlationId)
      const userId =
        user instanceof UserEntity ? user.id.value : user.userId.value
      const userDb = await userRepo.findOneByIdOrThrow(userId)

      const clientIp = getClientIp(req)

      if (clientIp && userDb.addIpAddress(new IpAddress(clientIp))) {
        userRepo.save(userDb)
      }
    })

    let currentRole

    if (user instanceof UserEntity && !_.isUndefined(user.role)) {
      currentRole = user.role
    } else {
      if (user instanceof EmployeeEntity) {
        currentRole = UserRoles.employee
        if (user.isFrozen) {
          return false
        }
        // End of access to app 29/07/2025
        if (new Date() > new Date('2025-07-29')) {
          return false
        }
        // Get deviceId from jwt
        const token = extractFunction(req as any)
        if (token) {
          const jwt = decodeJWT<JwtPayload>(token)
          req.deviceId = jwt?.deviceId
          req.email = jwt?.email
        }
      } else if (user instanceof OrganizationAdminEntity) {
        if (excludeOrganizationId) {
          return true
        }
        if (!req.organizationId) {
          return false
        }
        const secondCorrelationId = cryptoRandomString({ length: 8 })
        this.unitOfWork.execute(secondCorrelationId, async () => {
          const userWithOrganizationsIds = await this.unitOfWork
            .getOrganizationAdminRepository(secondCorrelationId)
            .findOneByIdOrThrow(user.id.value, ['organizations'])
          if (
            !userWithOrganizationsIds.isOrganizationAccessible(
              new UUID(req.organizationId!),
            )
          ) {
            return false
          }
        })
        currentRole = UserRoles.organizationAdmin
      } else if (user instanceof SuperAdminEntity) {
        currentRole = UserRoles.superAdmin
      }
    }

    // admin can access everything
    if (currentRole === UserRoles.superAdmin) return true

    if (currentRole !== role) return false

    return true
  }
}
