import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsOrder,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm'
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
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinProps,
} from '../../domain/entities/card-acquisition-payin.entity'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { CardAcquisitionPayinOrmEntity } from './card-acquisition-payin.orm-entity'
import { CardAcquisitionPayinOrmMapper } from './card-acquisition-payin.orm-mapper'
import { CardAcquisitionPayinRepositoryPort } from './card-acquisition-payin.repository.port'
import moment = require('moment')

@Injectable()
export class CardAcquisitionPayinRepository
  extends TypeormRepositoryBase<
    CardAcquisitionPayinEntity,
    CardAcquisitionPayinProps,
    CardAcquisitionPayinOrmEntity
  >
  implements CardAcquisitionPayinRepositoryPort
{
  protected relations: string[] = []
  private readonly authorizationExpirationTime = 6

  constructor(
    @InjectRepository(CardAcquisitionPayinOrmEntity)
    private readonly cardAcquisitionRepository: Repository<CardAcquisitionPayinOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      cardAcquisitionRepository,
      new CardAcquisitionPayinOrmMapper(
        CardAcquisitionPayinEntity,
        CardAcquisitionPayinOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByReference(
    reference: string,
  ): Promise<CardAcquisitionPayinOrmEntity | null> {
    const cardAcquisitionPayin = await this.cardAcquisitionRepository.findOne({
      where: { reference },
    })

    return cardAcquisitionPayin
  }

  async findOneByReferenceOrThrow(
    reference: string,
  ): Promise<CardAcquisitionPayinEntity> {
    const cardAcquisitionPayin = await this.findOneByReference(reference)
    if (!cardAcquisitionPayin) {
      throw new NotFoundException(
        `CardAcquisitionPayin with reference '${reference}' not found`,
      )
    }
    return this.mapper.toDomainEntity(cardAcquisitionPayin)
  }

  private async findOneActiveByEmployeeIdOrm(
    employeeId: string,
  ): Promise<CardAcquisitionPayinOrmEntity | null> {
    const cardAcquisitionPayin = await this.cardAcquisitionRepository.findOne({
      where: {
        employeeId,
        status: CardAcquisitionPayinStatus.Authorized,
        transactionExternalPaymentId: IsNull(),
      },
    })

    return cardAcquisitionPayin
  }

  async findOneActiveByEmployeeId(
    employeeId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined> {
    const cardAcquisitionPayin = await this.findOneActiveByEmployeeIdOrm(
      employeeId,
    )
    return cardAcquisitionPayin
      ? this.mapper.toDomainEntity(cardAcquisitionPayin)
      : undefined
  }

  async findOneActiveByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardAcquisitionPayinEntity> {
    const cardAcquisitionPayin = await this.findOneActiveByEmployeeIdOrm(
      employeeId,
    )
    if (!cardAcquisitionPayin) {
      throw new NotFoundException(
        `CardAcquisitionPayin with employeeId '${employeeId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(cardAcquisitionPayin)
  }

  async findOneActiveByExternalCardAcquisitionId(
    externalCardAcquisitionId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined> {
    const cardAcquisitionPayin = await this.cardAcquisitionRepository.findOne({
      where: {
        externalCardAcquisitionId,
        status: CardAcquisitionPayinStatus.Authorized,
        transactionExternalPaymentId: IsNull(),
      },
    })

    return cardAcquisitionPayin
      ? this.mapper.toDomainEntity(cardAcquisitionPayin)
      : undefined
  }

  async findOneActiveByExternalCardAcquisitionIdOrThrow(
    externalCardAcquisitionId: string,
  ): Promise<CardAcquisitionPayinEntity> {
    const cardAcquisitionPayin =
      await this.findOneActiveByExternalCardAcquisitionId(
        externalCardAcquisitionId,
      )
    if (!cardAcquisitionPayin) {
      throw new NotFoundException(
        `CardAcquisitionPayin with externalCardAcquisitionId '${externalCardAcquisitionId}' not found`,
      )
    }
    return cardAcquisitionPayin
  }

  private async findOneByTransactionExternalPaymentIdByStatus(
    transactionExternalPaymentId: string,
    status: CardAcquisitionPayinStatus[],
  ): Promise<CardAcquisitionPayinEntity | undefined> {
    const cardAcquisitionPayin = await this.cardAcquisitionRepository.findOne({
      where: {
        transactionExternalPaymentId,
        status: In(status),
      },
    })

    return cardAcquisitionPayin
      ? this.mapper.toDomainEntity(cardAcquisitionPayin)
      : undefined
  }

  async findOneByTransactionExternalPaymentIdAuthorized(
    transactionExternalPaymentId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined> {
    return this.findOneByTransactionExternalPaymentIdByStatus(
      transactionExternalPaymentId,
      [CardAcquisitionPayinStatus.Authorized],
    )
  }

  async findOneByTransactionExternalPaymentIdAuthorizedOrCaptured(
    transactionExternalPaymentId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined> {
    return this.findOneByTransactionExternalPaymentIdByStatus(
      transactionExternalPaymentId,
      [
        CardAcquisitionPayinStatus.Authorized,
        CardAcquisitionPayinStatus.Captured,
      ],
    )
  }

  async sumLast30DaysByStatusAndEmployeeId(
    employeeId: string,
    status: CardAcquisitionPayinStatus,
  ): Promise<number> {
    const res = await this.repository.manager
      .createQueryBuilder()
      .select(['SUM(card_acquisition_payin.amount) AS "sum"'])
      .from('card_acquisition_payin', 'card_acquisition_payin')
      .where({
        employeeId,
        status,
        createdAt: MoreThan(
          moment().subtract(30, 'days').startOf('day').toDate(),
        ),
      })
      .limit(1)
      .getRawOne()
    return res.sum ?? 0
  }

  async exists(reference: string): Promise<boolean> {
    const found = await this.findOneByReference(reference)
    if (found) {
      return true
    }
    return false
  }

  async findManyPending(): Promise<CardAcquisitionPayinEntity[]> {
    const cardAcquisitionPayins = await this.cardAcquisitionRepository.find({
      where: { status: CardAcquisitionPayinStatus.Pending },
    })

    return cardAcquisitionPayins.map((cardAcquisitionPayin) =>
      this.mapper.toDomainEntity(cardAcquisitionPayin),
    )
  }

  async findManyToBeExpired(): Promise<CardAcquisitionPayinEntity[]> {
    const cardAcquisitionPayins = await this.cardAcquisitionRepository.find({
      where: {
        status: CardAcquisitionPayinStatus.Authorized,
        createdAt: LessThan(
          moment()
            .subtract(this.authorizationExpirationTime, 'days')
            .startOf('day')
            .toDate(),
        ),
      },
    })

    return cardAcquisitionPayins.map((cardAcquisitionPayin) =>
      this.mapper.toDomainEntity(cardAcquisitionPayin),
    )
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<CardAcquisitionPayinProps>,
  ): FindOptionsOrder<CardAcquisitionPayinOrmEntity> {
    const order: FindOptionsOrder<CardAcquisitionPayinOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.externalAuthorizationId) {
      order.externalAuthorizationId = params.externalAuthorizationId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<CardAcquisitionPayinProps>,
  ): WhereCondition<CardAcquisitionPayinOrmEntity> {
    const where: WhereCondition<CardAcquisitionPayinOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.externalAuthorizationId) {
      where.externalAuthorizationId = params.externalAuthorizationId
    }
    return where
  }
}
