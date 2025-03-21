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
  CardPaymentEntity,
  CardPaymentProps,
} from '../../domain/entities/card-payment.entity'
import { CardPaymentOrmEntity } from './card-payment.orm-entity'
import { CardPaymentOrmMapper } from './card-payment.orm-mapper'
import { CardPaymentRepositoryPort } from './card-payment.repository.port'

@Injectable()
export class CardPaymentRepository
  extends TypeormRepositoryBase<
    CardPaymentEntity,
    CardPaymentProps,
    CardPaymentOrmEntity
  >
  implements CardPaymentRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(CardPaymentOrmEntity)
    private readonly cardPaymentRepository: Repository<CardPaymentOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      cardPaymentRepository,
      new CardPaymentOrmMapper(CardPaymentEntity, CardPaymentOrmEntity, config),
      logger,
    )
  }

  private async findOneByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<CardPaymentOrmEntity | null> {
    const cardPayment = await this.cardPaymentRepository.findOne({
      where: { externalPaymentId },
    })

    return cardPayment
  }

  async findOneByExternalPaymentIdOrThrow(
    externalPaymentId: string,
  ): Promise<CardPaymentEntity> {
    const cardPayment = await this.findOneByExternalPaymentId(externalPaymentId)
    if (!cardPayment) {
      throw new NotFoundException(
        `CardPayment with externalPaymentId '${externalPaymentId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(cardPayment)
  }

  private async findOneByCardId(
    cardId: string,
  ): Promise<CardPaymentOrmEntity | null> {
    const cardPayment = await this.cardPaymentRepository.findOne({
      where: { cardId },
    })

    return cardPayment
  }

  async findOneByCardIdOrThrow(cardId: string): Promise<CardPaymentEntity> {
    const cardPayment = await this.findOneByCardId(cardId)
    if (!cardPayment) {
      throw new NotFoundException(
        `CardPayment with cardId '${cardId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(cardPayment)
  }

  async exists(cardId: string): Promise<boolean> {
    const found = await this.findOneByCardId(cardId)
    if (found) {
      return true
    }
    return false
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<CardPaymentProps>,
  ): FindOptionsOrder<CardPaymentOrmEntity> {
    const order: FindOptionsOrder<CardPaymentOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.cardId) {
      order.cardId = params.cardId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<CardPaymentProps>,
  ): WhereCondition<CardPaymentOrmEntity> {
    const where: WhereCondition<CardPaymentOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.cardId) {
      where.cardId = params.cardId.value
    }
    return where
  }
}
