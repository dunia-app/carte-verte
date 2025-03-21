import {
  DataWithPaginationMeta,
  RepositoryPort,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  OrganizationAdminEntity,
  OrganizationAdminProps,
} from '../../domain/entities/organization-admin.entity'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'

export interface OrganizationAdminToBeRemindedQuery {
  firstname: string
  receiverId: string
  daysLeft: number
}

export interface OrganizationAdminThatAwaitsPaymentQuery {
  firstname: string
  receiverId: string
  daysSinceDistribution: number
}

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface OrganizationAdminRepositoryPort
  extends RepositoryPort<OrganizationAdminEntity, OrganizationAdminProps> {
  findOneByUserIdOrThrow(userId: string): Promise<OrganizationAdminEntity>
  findManyWithInfoByOrganizationId(
    organizationId: string,
    limit?: number,
    offset?: number,
  ): Promise<DataWithPaginationMeta<FindOrganizationAdminResponseProps[]>>
  adminOrganizationIdCount(organizationId: string): Promise<number>
  exists(userId: string): Promise<boolean>
  existsInOrganization(userId: string, organizationId: string): Promise<boolean>
}
