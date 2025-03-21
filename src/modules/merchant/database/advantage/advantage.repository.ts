import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, In, Repository } from 'typeorm'
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
  AdvantageEntity,
  AdvantageProps,
} from '../../domain/entities/advantage.entity'
import { AdvantageType } from '../../domain/entities/advantage.types'
import { MerchantRepository } from '../merchant/merchant.repository'
import { AdvantageOrmEntity } from './advantage.orm-entity'
import { AdvantageOrmMapper } from './advantage.orm-mapper'
import { AdvantageRepositoryPort } from './advantage.repository.port'

@Injectable()
export class AdvantageRepository
  extends TypeormRepositoryBase<
    AdvantageEntity,
    AdvantageProps,
    AdvantageOrmEntity
  >
  implements AdvantageRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(AdvantageOrmEntity)
    private readonly advantageRepository: Repository<AdvantageOrmEntity>,
    private readonly merchantRepo: MerchantRepository,
    protected readonly config: ConfigService,
  ) {
    super(
      advantageRepository,
      new AdvantageOrmMapper(AdvantageEntity, AdvantageOrmEntity, config),
      logger,
    )
  }

  private async findOneByType(
    type: AdvantageType,
  ): Promise<AdvantageOrmEntity | null> {
    const advantage = await this.advantageRepository.findOne({
      where: { type },
    })

    return advantage
  }

  async findOneByTypeOrThrow(type: AdvantageType): Promise<AdvantageEntity> {
    const advantage = await this.findOneByType(type)
    if (!advantage) {
      throw new NotFoundException(`Advantage with type '${type}' not found`)
    }
    return this.mapper.toDomainEntity(advantage)
  }

  async exists(type: AdvantageType): Promise<boolean> {
    const found = await this.findOneByType(type)
    if (found) {
      return true
    }
    return false
  }

  async findMany(): Promise<AdvantageEntity[]> {
    const result = await this.advantageRepository.find({
      relations: [...this.relations],
    })
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByType(types: AdvantageType[]): Promise<AdvantageEntity[]> {
    const result = await this.advantageRepository.find({
      where: {
        type: In(types),
      },
      relations: [...this.relations],
    })
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyAllowedForMid(mid: string): Promise<AdvantageEntity[]> {
    const isMidBlacklisted = await this.merchantRepo.isMidBlacklisted(mid)
    if (isMidBlacklisted) {
      return []
    }
    const [advantages] = await Promise.all([this.findMany()])
    return advantages.filter((advantage) => {
      switch (advantage.type) {
        case AdvantageType.EXTERNAL:
          return true
        case AdvantageType.NONE:
          return true
        case AdvantageType.MEALTICKET:
          return false
        case AdvantageType.CULTURALCHEQUE:
          return false
        case AdvantageType.GIFTCARD:
          return false
        case AdvantageType.MOBILITYFORFAIT:
          return false
      }
    })
  }

  async isMccAllowed(mcc: string): Promise<boolean> {
    const advantage = await this.findManyAllowedForMcc(mcc)
    return advantage.length > 0
  }

  async findManyAllowedForMcc(mcc: string): Promise<AdvantageEntity[]> {
    const result = await this.repository
      .createQueryBuilder('advantage')
      .leftJoin(
        'advantage_merchant_category',
        'advantage_merchant_category',
        'advantage_merchant_category."advantageId" = "advantage"."id"',
      )
      .leftJoin(
        'merchant_category',
        'merchant_category',
        'merchant_category."id" = "advantage_merchant_category"."merchantCategoryId"',
      )
      .where('merchant_category."mcc" = :mcc', {
        mcc: mcc,
      })
      .getMany()
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByEmployeeId(employeeId: string): Promise<AdvantageEntity[]> {
    const result = await this.repository
      .createQueryBuilder('advantage')
      .leftJoin('wallet', 'wallet', 'wallet."advantage" = "advantage"."type"')
      .where('wallet."employeeId" = :employeeId', {
        employeeId: employeeId,
      })
      .getMany()
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<AdvantageProps>,
  ): FindOptionsOrder<AdvantageOrmEntity> {
    const order: FindOptionsOrder<AdvantageOrmEntity> = {}
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
    params: QueryParams<AdvantageProps>,
  ): WhereCondition<AdvantageOrmEntity> {
    const where: WhereCondition<AdvantageOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.name) {
      where.name = params.name
    }
    if (params.type) {
      where.type = params.type
    }
    if (params.index) {
      where.index = params.index
    }
    if (params.limitPeriod) {
      where.limitPeriod = params.limitPeriod
    }
    if (params.workingDaysOnly) {
      where.workingDaysOnly = params.workingDaysOnly
    }
    return where
  }
}
