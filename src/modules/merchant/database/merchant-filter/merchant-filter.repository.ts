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
import { AdvantageType } from '../../domain/entities/advantage.types'
import {
  MerchantFilterEntity,
  MerchantFilterProps,
} from '../../domain/entities/merchant-filter.entity'
import { MerchantFilterOrmEntity } from './merchant-filter.orm-entity'
import { MerchantFilterOrmMapper } from './merchant-filter.orm-mapper'
import { MerchantFilterRepositoryPort } from './merchant-filter.repository.port'

@Injectable()
export class MerchantFilterRepository
  extends TypeormRepositoryBase<
    MerchantFilterEntity,
    MerchantFilterProps,
    MerchantFilterOrmEntity
  >
  implements MerchantFilterRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(MerchantFilterOrmEntity)
    private readonly merchantFilterRepository: Repository<MerchantFilterOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantFilterRepository,
      new MerchantFilterOrmMapper(
        MerchantFilterEntity,
        MerchantFilterOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByCode(
    code: string,
  ): Promise<MerchantFilterOrmEntity | null> {
    const merchantFilter = await this.merchantFilterRepository.findOne({
      where: { code: code },
    })

    return merchantFilter
  }

  async findOneByCodeOrThrow(code: string): Promise<MerchantFilterEntity> {
    const merchantFilter = await this.findOneByCode(code)
    if (!merchantFilter) {
      throw new NotFoundException(
        `MerchantFilter with code '${code}' not found`,
      )
    }
    return this.mapper.toDomainEntity(merchantFilter)
  }

  async findManyByCode(codes: string[]): Promise<MerchantFilterEntity[]> {
    const merchantFilter = await this.merchantFilterRepository.find({
      where: { code: In(codes) },
    })

    return merchantFilter.map((merchantFilter) =>
      this.mapper.toDomainEntity(merchantFilter),
    )
  }

  async findManyByParentCode(
    parentCode: AdvantageType,
  ): Promise<MerchantFilterEntity[]> {
    const merchantFilter = await this.merchantFilterRepository.find({
      where: { parentCode: parentCode },
    })

    return merchantFilter.map((merchantFilter) =>
      this.mapper.toDomainEntity(merchantFilter),
    )
  }

  async exists(code: string): Promise<boolean> {
    const found = await this.findOneByCode(code)
    if (found) {
      return true
    }
    return false
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<MerchantFilterProps>,
  ): FindOptionsOrder<MerchantFilterOrmEntity> {
    const order: FindOptionsOrder<MerchantFilterOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.code) {
      order.code = params.code
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<MerchantFilterProps>,
  ): WhereCondition<MerchantFilterOrmEntity> {
    const where: WhereCondition<MerchantFilterOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.code) {
      where.code = params.code
    }
    return where
  }
}
