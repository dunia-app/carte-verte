import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, Repository, SelectQueryBuilder } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  DataWithPaginationMeta,
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  OrganizationAdminEntity,
  OrganizationAdminProps,
} from '../../../../modules/organization/domain/entities/organization-admin.entity'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'
import { OrganizationAdminOrmEntity } from './organization-admin.orm-entity'
import { OrganizationAdminOrmMapper } from './organization-admin.orm-mapper'
import { OrganizationAdminRepositoryPort } from './organization-admin.repository.port'

@Injectable()
export class OrganizationAdminRepository
  extends TypeormRepositoryBase<
    OrganizationAdminEntity,
    OrganizationAdminProps,
    OrganizationAdminOrmEntity
  >
  implements OrganizationAdminRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(OrganizationAdminOrmEntity)
    private readonly organizationAdminRepository: Repository<OrganizationAdminOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      organizationAdminRepository,
      new OrganizationAdminOrmMapper(
        OrganizationAdminEntity,
        OrganizationAdminOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByUserId(
    userId: string,
  ): Promise<OrganizationAdminOrmEntity | null> {
    const organizationAdmin = await this.organizationAdminRepository.findOne({
      where: { userId },
      relations: ['organizations'],
    })

    return organizationAdmin
  }

  async findOneByUserIdOrThrow(
    userId: string,
  ): Promise<OrganizationAdminEntity> {
    const organizationAdmin = await this.findOneByUserId(userId)
    if (!organizationAdmin) {
      throw new NotFoundException(
        `OrganizationAdmin with userId '${userId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(organizationAdmin)
  }

  async findOneWithInfoById(
    id: string,
  ): Promise<FindOrganizationAdminResponseProps> {
    const rawRes = await this.organizationAdminInfoQuery()
      .where('"organization_admin"."id" = :id', { id })
      .limit(1)
      .getRawOne<TWithStringKeys<string>>()

    if (!rawRes) {
      throw new NotFoundException(`OrganizationAdmin with id '${id}' not found`)
    }
    return {
      id: new UUID(rawRes.id),
      createdAt: new DateVO(rawRes.createdAt),
      updatedAt: new DateVO(rawRes.updatedAt),
      userId: rawRes.userId,
      firstname: rawRes.firstname,
      lastname: rawRes.lastname,
      email: rawRes.email,
    }
  }

  async findOneWithInfoByIdAndOrganizationId(
    id: string,
    organizationId: string,
  ): Promise<FindOrganizationAdminResponseProps> {
    const rawRes = await this.organizationAdminInfoQuery()
      .leftJoin(
        'organization_admins_organizations',
        'oao',
        'oao.adminId = organization_admin.id',
      )
      .where('"oao"."organizationId" = :organizationId', { organizationId })
      .andWhere('"oao"."adminId" = :id', { id })
      .limit(1)
      .getRawOne<TWithStringKeys<string>>()

    if (!rawRes) {
      throw new NotFoundException(
        `OrganizationAdmin with id '${id}' and organizationId '${organizationId}' not found`,
      )
    }
    return {
      id: new UUID(rawRes.id),
      createdAt: new DateVO(rawRes.createdAt),
      updatedAt: new DateVO(rawRes.updatedAt),
      userId: rawRes.userId,
      firstname: rawRes.firstname,
      lastname: rawRes.lastname,
      email: rawRes.email,
    }
  }

  async adminOrganizationIdCount(organizationId: string): Promise<number> {
    return this.repository
      .createQueryBuilder('organization_admin')
      .innerJoin(
        'organization_admins_organizations',
        'oao',
        'oao.adminId = organization_admin.id',
      )
      .where('oao.organizationId = :organizationId', { organizationId })
      .getCount()
  }

  async findManyWithInfoByOrganizationId(
    organizationId: string,
    limit?: number,
    offset?: number,
  ): Promise<DataWithPaginationMeta<FindOrganizationAdminResponseProps[]>> {
    const actualLimit = Math.max(
      Math.min(limit || 20, this.paginationLimitMax),
      1,
    )
    const [rawRes, count] = await Promise.all([
      this.organizationAdminInfoQuery()
        .leftJoin(
          'organization_admins_organizations',
          'oao',
          'oao."adminId" = "organization_admin"."id"',
        )
        .where('"oao"."organizationId" = :organizationId', {
          organizationId,
        })
        .limit(actualLimit)
        .offset(offset)
        .getRawMany<TWithStringKeys<string>>(),
      this.adminOrganizationIdCount(organizationId),
    ])

    const result: DataWithPaginationMeta<FindOrganizationAdminResponseProps[]> =
      {
        data: rawRes.map((item): FindOrganizationAdminResponseProps => {
          return {
            id: new UUID(item.id),
            createdAt: new DateVO(item.createdAt),
            updatedAt: new DateVO(item.updatedAt),
            userId: item.userId,
            firstname: item.firstname,
            lastname: item.lastname,
            email: item.email,
          }
        }),
        count: count,
        limit: limit,
      }
    return result
  }

  private organizationAdminInfoQuery(): SelectQueryBuilder<OrganizationAdminOrmEntity> {
    return this.repository
      .createQueryBuilder('organization_admin')
      .select([
        'organization_admin.id "id"',
        'organization_admin.createdAt "createdAt"',
        'organization_admin.updatedAt "updatedAt"',
        'organization_admin.userId "userId"',
        'user.firstname "firstname"',
        'user.lastname "lastname"',
        'receiver.email "email"',
      ])
      .leftJoin('user', 'user', '"user"."id" = "organization_admin"."userId"')
      .leftJoin(
        'receiver',
        'receiver',
        '"organization_admin"."userId" = "receiver"."userId"',
      )
  }

  async exists(userId: string): Promise<boolean> {
    const found = await this.findOneByUserId(userId)
    if (found) {
      return true
    }
    return false
  }

  async existsInOrganization(
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    const found = await this.organizationAdminRepository
      .createQueryBuilder('organization_admin')
      .innerJoin(
        'organization_admins_organizations',
        'oao',
        'oao.adminId = organization_admin.id',
      )
      .where('organization_admin.userId = :userId', { userId })
      .andWhere('oao.organizationId = :organizationId', { organizationId })
      .getOne()
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<OrganizationAdminProps>,
  ): FindOptionsOrder<OrganizationAdminOrmEntity> {
    const order: FindOptionsOrder<OrganizationAdminOrmEntity> = {}
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
    params: QueryParams<OrganizationAdminProps>,
  ): WhereCondition<OrganizationAdminOrmEntity> {
    const where: WhereCondition<OrganizationAdminOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.userId) {
      where.userId = params.userId.value
    }
    return where
  }
}
