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
  TransferEntity,
  TransferProps,
} from '../../domain/entities/transfer.entity'
import { TransferOrmEntity } from './transfer.orm-entity'
import { TransferOrmMapper } from './transfer.orm-mapper'
import { TransferRepositoryPort } from './transfer.repository.port'

@Injectable()
export class TransferRepository
  extends TypeormRepositoryBase<
    TransferEntity,
    TransferProps,
    TransferOrmEntity
  >
  implements TransferRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(TransferOrmEntity)
    private readonly transferRepository: Repository<TransferOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      transferRepository,
      new TransferOrmMapper(TransferEntity, TransferOrmEntity, config),
      logger,
    )
  }

  private async findOneByWalletId(
    walletId: string,
  ): Promise<TransferOrmEntity | null> {
    const transfer = await this.transferRepository.findOne({
      where: { walletId },
    })

    return transfer
  }

  async findOneByWalletIdOrThrow(walletId: string): Promise<TransferEntity> {
    const transfer = await this.findOneByWalletId(walletId)
    if (!transfer) {
      throw new NotFoundException(
        `Transfer with walletId '${walletId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(transfer)
  }

  async exists(walletId: string): Promise<boolean> {
    const found = await this.findOneByWalletId(walletId)
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to construct a query
  protected orderQuery(
    params: OrderBy<TransferProps>,
  ): FindOptionsOrder<TransferOrmEntity> {
    const order: FindOptionsOrder<TransferOrmEntity> = {}
    if (_.isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.walletId) {
      order.walletId = params.walletId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<TransferProps>,
  ): WhereCondition<TransferOrmEntity> {
    const where: WhereCondition<TransferOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.walletId) {
      where.walletId = params.walletId.value
    }
    return where
  }
}
