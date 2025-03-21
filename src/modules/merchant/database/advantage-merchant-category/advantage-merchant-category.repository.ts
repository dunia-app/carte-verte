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
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  AdvantageMerchantCategoryEntity,
  AdvantageMerchantCategoryProps,
} from '../../domain/entities/advantage-merchant-category.entity'
import { AdvantageMerchantCategoryOrmEntity } from './advantage-merchant-category.orm-entity'
import { AdvantageMerchantCategoryOrmMapper } from './advantage-merchant-category.orm-mapper'
import { AdvantageMerchantCategoryRepositoryPort } from './advantage-merchant-category.repository.port'

@Injectable()
export class AdvantageMerchantCategoryRepository
  extends TypeormRepositoryBase<
    AdvantageMerchantCategoryEntity,
    AdvantageMerchantCategoryProps,
    AdvantageMerchantCategoryOrmEntity
  >
  implements AdvantageMerchantCategoryRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(AdvantageMerchantCategoryOrmEntity)
    private readonly advantageMerchantCategoryRepository: Repository<AdvantageMerchantCategoryOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      advantageMerchantCategoryRepository,
      new AdvantageMerchantCategoryOrmMapper(
        AdvantageMerchantCategoryEntity,
        AdvantageMerchantCategoryOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByAdvantageId(
    advantageId: string,
  ): Promise<AdvantageMerchantCategoryOrmEntity | null> {
    const advantageMerchantCategory =
      await this.advantageMerchantCategoryRepository.findOne({
        where: { advantageId },
      })

    return advantageMerchantCategory
  }

  async findOneByAdvantageIdOrThrow(
    advantageId: string,
  ): Promise<AdvantageMerchantCategoryEntity> {
    const advantageMerchantCategory = await this.findOneByAdvantageId(
      advantageId,
    )
    if (!advantageMerchantCategory) {
      throw new NotFoundException(
        `AdvantageMerchantCategory with advantageId '${advantageId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(advantageMerchantCategory)
  }

  private async findOneByAdvantageIdMerchantCategoryId(
    advantageId: string,
    merchantCategoryId: string,
  ): Promise<AdvantageMerchantCategoryOrmEntity | null> {
    const advantageMerchantCategory =
      await this.advantageMerchantCategoryRepository.findOne({
        where: { advantageId, merchantCategoryId },
      })

    return advantageMerchantCategory
  }

  async exists(
    advantageId: string,
    merchantCategoryId: string,
  ): Promise<boolean> {
    const found = await this.findOneByAdvantageIdMerchantCategoryId(
      advantageId,
      merchantCategoryId,
    )
    if (found) {
      return true
    }
    return false
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<AdvantageMerchantCategoryProps>,
  ): FindOptionsOrder<AdvantageMerchantCategoryOrmEntity> {
    const order: FindOptionsOrder<AdvantageMerchantCategoryOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.advantageId) {
      order.advantageId = params.advantageId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<AdvantageMerchantCategoryProps>,
  ): WhereCondition<AdvantageMerchantCategoryOrmEntity> {
    const where: WhereCondition<AdvantageMerchantCategoryOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.advantageId) {
      where.advantageId = params.advantageId.value
    }
    return where
  }
}
