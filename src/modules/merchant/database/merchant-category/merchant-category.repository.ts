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
  MerchantCategoryEntity,
  MerchantCategoryProps,
} from '../../domain/entities/merchant-category.entity'
import { MerchantCategoryOrmEntity } from './merchant-category.orm-entity'
import { MerchantCategoryOrmMapper } from './merchant-category.orm-mapper'
import { MerchantCategoryRepositoryPort } from './merchant-category.repository.port'

@Injectable()
export class MerchantCategoryRepository
  extends TypeormRepositoryBase<
    MerchantCategoryEntity,
    MerchantCategoryProps,
    MerchantCategoryOrmEntity
  >
  implements MerchantCategoryRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(MerchantCategoryOrmEntity)
    private readonly merchantCategoryRepository: Repository<MerchantCategoryOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantCategoryRepository,
      new MerchantCategoryOrmMapper(
        MerchantCategoryEntity,
        MerchantCategoryOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByMccOrm(
    mcc: string,
  ): Promise<MerchantCategoryOrmEntity | null> {
    const merchantCategory = await this.merchantCategoryRepository.findOne({
      where: { mcc },
    })

    return merchantCategory
  }

  async findOneByMcc(mcc: string): Promise<MerchantCategoryEntity | undefined> {
    const merchantCategory = await this.findOneByMccOrm(mcc)

    return merchantCategory
      ? this.mapper.toDomainEntity(merchantCategory)
      : undefined
  }

  async findOneByMccOrThrow(mcc: string): Promise<MerchantCategoryEntity> {
    const merchantCategory = await this.findOneByMccOrm(mcc)
    if (!merchantCategory) {
      throw new NotFoundException(
        `MerchantCategory with mcc '${mcc}' not found`,
      )
    }
    return this.mapper.toDomainEntity(merchantCategory)
  }

  async findManyByMcc(mcc: string[]): Promise<MerchantCategoryEntity[]> {
    const result = await this.merchantCategoryRepository.find({
      where: { mcc: In(mcc) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async exists(mcc: string): Promise<boolean> {
    const found = await this.findOneByMcc(mcc)
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<MerchantCategoryProps>,
  ): FindOptionsOrder<MerchantCategoryOrmEntity> {
    const order: FindOptionsOrder<MerchantCategoryOrmEntity> = {}
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
    params: QueryParams<MerchantCategoryProps>,
  ): WhereCondition<MerchantCategoryOrmEntity> {
    const where: WhereCondition<MerchantCategoryOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.mcc) {
      where.mcc = params.mcc.value
    }
    return where
  }
}
