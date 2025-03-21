import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, IsNull, Not, Repository } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  OrganizationEntity,
  OrganizationProps,
} from '../../../../modules/organization/domain/entities/organization.entity'
import { OrganizationOrmEntity } from './organization.orm-entity'
import { OrganizationOrmMapper } from './organization.orm-mapper'
import { OrganizationRepositoryPort } from './organization.repository.port'

@Injectable()
export class OrganizationRepository
  extends TypeormRepositoryBase<
    OrganizationEntity,
    OrganizationProps,
    OrganizationOrmEntity
  >
  implements OrganizationRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(OrganizationOrmEntity)
    private readonly organizationRepository: Repository<OrganizationOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      organizationRepository,
      new OrganizationOrmMapper(
        OrganizationEntity,
        OrganizationOrmEntity,
        config,
      ),
      logger,
    )
  }

  async findOneByName(name: string): Promise<OrganizationEntity | null> {
    const organization = await this.organizationRepository.findOne({
      where: { name },
    })

    return organization ? this.mapper.toDomainEntity(organization) : null
  }

  async findOneByNameOrThrow(name: string): Promise<OrganizationEntity> {
    const organization = await this.findOneByName(name)
    if (!organization) {
      throw new NotFoundException(`Organization with name '${name}' not found`)
    }
    return organization
  }

  async exists(name: string): Promise<boolean> {
    const found = await this.findOneByName(name)
    if (found) {
      return true
    }
    return false
  }

  async findOneByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<OrganizationEntity> {
    const organization = await this.repository
      .createQueryBuilder('organization')
      .leftJoin(
        'employee',
        'employee',
        'employee."organizationId" = organization.id',
      )
      .where('employee.id = :employeeId', { employeeId })
      .getOne()
    if (!organization) {
      throw new NotFoundException(
        `Organization with employeeId '${employeeId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(organization)
  }

  async findManyWithInvalidatedSiret(): Promise<OrganizationEntity[]> {
    const organizations = await this.organizationRepository.find({
      where: {
        siret: Not(IsNull()),
        city: IsNull(),
      },
    })

    return organizations.map((organization) =>
      this.mapper.toDomainEntity(organization),
    )
  }

  async findAvailableOrganizationsByAdminId(
    adminId: string,
  ): Promise<OrganizationEntity[]> {
    const organizations = await this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoin(
        'organization_admins_organizations',
        'joinTable',
        'joinTable.organizationId = organization.id',
      )
      .where('joinTable.adminId = :adminId', { adminId })
      .getMany()

    return organizations.map((organization) =>
      this.mapper.toDomainEntity(organization),
    )
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<OrganizationProps>,
  ): FindOptionsOrder<OrganizationOrmEntity> {
    const order: FindOptionsOrder<OrganizationOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<OrganizationProps>,
  ): WhereCondition<OrganizationOrmEntity> {
    const where: WhereCondition<OrganizationOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.name) {
      where.name = params.name.value
    }
    if (params.address?.city) {
      where.city = params.address.city
    }
    if (params.address?.street) {
      where.street = params.address.street
    }
    if (params.address?.postalCode) {
      where.postalCode = params.address.postalCode
    }
    return where
  }
}
