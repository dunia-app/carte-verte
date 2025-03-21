import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import _ from 'lodash'
import { FindOptionsOrder, Repository } from 'typeorm'
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
import {
  SuperAdminEntity,
  SuperAdminProps,
} from '../../../../modules/user/domain/entities/super-admin.entity'
import { SuperAdminOrmEntity } from './super-admin.orm-entity'
import { SuperAdminOrmMapper } from './super-admin.orm-mapper'
import { SuperAdminRepositoryPort } from './super-admin.repository.port'

@Injectable()
export class SuperAdminRepository
  extends TypeormRepositoryBase<
    SuperAdminEntity,
    SuperAdminProps,
    SuperAdminOrmEntity
  >
  implements SuperAdminRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(SuperAdminOrmEntity)
    private readonly superAdminRepository: Repository<SuperAdminOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      superAdminRepository,
      new SuperAdminOrmMapper(SuperAdminEntity, SuperAdminOrmEntity, config),
      logger,
    )
  }

  private async findOneByUserId(
    userId: string,
  ): Promise<SuperAdminOrmEntity | null> {
    const superAdmin = await this.superAdminRepository.findOne({
      where: { userId },
    })

    return superAdmin
  }

  async findOneByUserIdOrThrow(userId: string): Promise<SuperAdminEntity> {
    const superAdmin = await this.findOneByUserId(userId)
    if (!superAdmin) {
      throw new NotFoundException(
        `SuperAdmin with userId '${userId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(superAdmin)
  }

  async exists(userId: string): Promise<boolean> {
    const found = await this.findOneByUserId(userId)
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to construct a query
  protected orderQuery(
    params: OrderBy<SuperAdminProps>,
  ): FindOptionsOrder<SuperAdminOrmEntity> {
    const order: FindOptionsOrder<SuperAdminOrmEntity> = {}
    if (_.isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.userId) {
      order.userId = params.userId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<SuperAdminProps>,
  ): WhereCondition<SuperAdminOrmEntity> {
    const where: WhereCondition<SuperAdminOrmEntity> = {}
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
