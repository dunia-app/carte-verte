import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  MerchantMerchantFilterEntity,
  MerchantMerchantFilterProps,
} from '../../domain/entities/merchant-merchant-filter.entity'
import { MerchantMerchantFilterOrmEntity } from './merchant-merchant-filter.orm-entity'
import { MerchantMerchantFilterOrmMapper } from './merchant-merchant-filter.orm-mapper'
import { MerchantMerchantFilterRepositoryPort } from './merchant-merchant-filter.repository.port'

@Injectable()
export class MerchantMerchantFilterRepository
  extends TypeormRepositoryBase<
    MerchantMerchantFilterEntity,
    MerchantMerchantFilterProps,
    MerchantMerchantFilterOrmEntity
  >
  implements MerchantMerchantFilterRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(MerchantMerchantFilterOrmEntity)
    private readonly merchantFilterRepository: Repository<MerchantMerchantFilterOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantFilterRepository,
      new MerchantMerchantFilterOrmMapper(
        MerchantMerchantFilterEntity,
        MerchantMerchantFilterOrmEntity,
        config,
      ),
      logger,
    )
  }

  async findManyByCode(code: string): Promise<MerchantMerchantFilterEntity[]> {
    const merchantFilter = await this.merchantFilterRepository.find({
      where: { code: code },
    })

    return merchantFilter.map((merchantFilter) =>
      this.mapper.toDomainEntity(merchantFilter),
    )
  }

  async findManyByMid(mid: string): Promise<MerchantMerchantFilterEntity[]> {
    const merchantFilter = await this.merchantFilterRepository.find({
      where: { mid: mid },
    })

    return merchantFilter.map((merchantFilter) =>
      this.mapper.toDomainEntity(merchantFilter),
    )
  }

  async findOneByCodeAndMid(
    code: string,
    mid: string,
  ): Promise<MerchantMerchantFilterEntity | null> {
    const merchantFilter = await this.merchantFilterRepository.findOne({
      where: { code: code, mid: mid },
    })

    return merchantFilter ? this.mapper.toDomainEntity(merchantFilter) : null
  }

  async exists(code: string, mid: string): Promise<boolean> {
    const found = await this.findOneByCodeAndMid(code, mid)
    if (found) {
      return true
    }
    return false
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<MerchantMerchantFilterProps>,
  ): FindOptionsOrder<MerchantMerchantFilterOrmEntity> {
    const order: FindOptionsOrder<MerchantMerchantFilterOrmEntity> = {}
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
    params: QueryParams<MerchantMerchantFilterProps>,
  ): WhereCondition<MerchantMerchantFilterOrmEntity> {
    const where: WhereCondition<MerchantMerchantFilterOrmEntity> = {}
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
