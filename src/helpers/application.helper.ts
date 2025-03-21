import { ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { FastifyRequest } from 'fastify'
import { ServerResponse } from 'http'
import { AppLogger } from '../infrastructure/logger/logger'
import { TWithStringKeys } from '../libs/types/t-with-keys'
import { EmployeeEntity } from '../modules/organization/domain/entities/employee.entity'
import { OrganizationAdminEntity } from '../modules/organization/domain/entities/organization-admin.entity'
import { OrganizationEntity } from '../modules/organization/domain/entities/organization.entity'
import { SuperAdminEntity } from '../modules/user/domain/entities/super-admin.entity'
import { UserEntity } from '../modules/user/domain/entities/user.entity'

const logger = new AppLogger()
export { logger }

export type AppRequest = Omit<FastifyRequest, 'user'> & {
  correlationId: string
  user: UserEntity | SuperAdminEntity | OrganizationAdminEntity | EmployeeEntity
  organization?: OrganizationEntity
  deviceId?: string
  organizationId?: string
  email?: string
}
export function getRequest(context: ExecutionContext) {
  let req: AppRequest
  if (context.getType() === 'http') {
    const httpContext = context.switchToHttp()
    req = httpContext.getRequest()
  } else {
    const ctx = GqlExecutionContext.create(context)
    req = ctx.getContext().req as AppRequest
  }

  req.organizationId = req.headers['organizationid'] as string
  req.headers = keepBearerAuthorization(req.headers)
  return req
}

function keepBearerAuthorization(headers: TWithStringKeys) {
  const clientBearer = headers['client-bearer'] as string
  // We replace Basic headers (nginx side) with our custom bearer header
  if (clientBearer) {
    headers['authorization'] = clientBearer
  }
  return headers
}

export function getResponse(
  context: ExecutionContext,
  asServerResponse = true,
) {
  let resp: ServerResponse
  if (context.getType() === 'http') {
    const httpContext = context.switchToHttp()
    resp = httpContext.getResponse()
  } else {
    const ctx = GqlExecutionContext.create(context)
    const fastifyReply = ctx.getContext().res
    resp = asServerResponse ? fastifyReply.raw : fastifyReply
  }
  return resp
}

/*
 *pauses execution, usefull to avoid locking a task for too long
 */
export async function pauseExec(time = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
