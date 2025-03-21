import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  OrganizationEntity,
  OrganizationProps,
} from '../../domain/entities/organization.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface OrganizationRepositoryPort
  extends RepositoryPort<OrganizationEntity, OrganizationProps> {
  findOneByName(name: string): Promise<OrganizationEntity | null>
  findOneByNameOrThrow(name: string): Promise<OrganizationEntity>
  exists(name: string): Promise<boolean>
  findOneByEmployeeIdOrThrow(employeeId: string): Promise<OrganizationEntity>
  findManyWithInvalidatedSiret(): Promise<OrganizationEntity[]>
  findAvailableOrganizationsByAdminId(
    adminId: string,
  ): Promise<OrganizationEntity[]>
}
