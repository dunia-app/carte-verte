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
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import {
  CardAcquisitionEntity,
  CardAcquisitionProps,
} from '../../domain/entities/card-acquisition.entity'
import { CardAcquisitionOrmEntity } from './card-acquisition.orm-entity'
import { CardAcquisitionOrmMapper } from './card-acquisition.orm-mapper'
import { CardAcquisitionRepositoryPort } from './card-acquisition.repository.port'

@Injectable()
export class CardAcquisitionRepository
  extends TypeormRepositoryBase<
    CardAcquisitionEntity,
    CardAcquisitionProps,
    CardAcquisitionOrmEntity
  >
  implements CardAcquisitionRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(CardAcquisitionOrmEntity)
    private readonly cardAcquisitionRepository: Repository<CardAcquisitionOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      cardAcquisitionRepository,
      new CardAcquisitionOrmMapper(
        CardAcquisitionEntity,
        CardAcquisitionOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByExternalId(
    externalId: string,
  ): Promise<CardAcquisitionOrmEntity | null> {
    const cardAcquisition = await this.cardAcquisitionRepository.findOne({
      where: { externalId },
    })

    return cardAcquisition
  }

  async findOneByExternalIdOrThrow(
    externalId: string,
  ): Promise<CardAcquisitionEntity> {
    const cardAcquisition = await this.findOneByExternalId(externalId)
    if (!cardAcquisition) {
      throw new NotFoundException(
        `CardAcquisition with externalId '${externalId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(cardAcquisition)
  }

  async findOneActiveByEmployeeId(
    employeeId: string,
  ): Promise<CardAcquisitionEntity | null> {
    const cardAcquisition = await this.cardAcquisitionRepository.findOne({
      where: {
        employeeId,
        isActive: true,
        status: CardAcquisitionPayinStatus.Authorized,
      },
    })

    return cardAcquisition ? this.mapper.toDomainEntity(cardAcquisition) : null
  }

  async findOneActiveByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardAcquisitionEntity> {
    const cardAcquisition = await this.findOneActiveByEmployeeId(employeeId)
    if (!cardAcquisition) {
      throw new NotFoundException(
        `CardAcquisition with employeeId '${employeeId}' not found`,
      )
    }
    return cardAcquisition
  }

  async findOneActiveOrPendingByEmployeeId(
    employeeId: string,
  ): Promise<CardAcquisitionEntity | null> {
    const cardAcquisition = await this.cardAcquisitionRepository.findOne({
      where: {
        employeeId,
        isActive: true,
        status: In([
          CardAcquisitionPayinStatus.Authorized,
          CardAcquisitionPayinStatus.Pending,
        ]),
      },
    })

    return cardAcquisition ? this.mapper.toDomainEntity(cardAcquisition) : null
  }

  async findOneActiveOrPendingByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardAcquisitionEntity> {
    const cardAcquisition = await this.findOneActiveOrPendingByEmployeeId(
      employeeId,
    )
    if (!cardAcquisition) {
      throw new NotFoundException(
        `CardAcquisition with employeeId '${employeeId}' not found`,
      )
    }
    return cardAcquisition
  }

  async exists(externalId: string): Promise<boolean> {
    const found = await this.findOneByExternalId(externalId)
    if (found) {
      return true
    }
    return false
  }

  async findManyByExternalIds(
    externalIds: string[],
  ): Promise<CardAcquisitionEntity[]> {
    const cardAcquisitions = await this.cardAcquisitionRepository.find({
      where: { externalId: In(externalIds) },
    })
    return cardAcquisitions.map((cardAcquisition) =>
      this.mapper.toDomainEntity(cardAcquisition),
    )
  }

  async findManyPending(): Promise<CardAcquisitionEntity[]> {
    const cardAcquisitions = await this.cardAcquisitionRepository.find({
      where: { status: CardAcquisitionPayinStatus.Pending },
    })
    return cardAcquisitions.map((cardAcquisition) =>
      this.mapper.toDomainEntity(cardAcquisition),
    )
  }

  async findManyWithoutBaasId(): Promise<CardAcquisitionEntity[]> {
    const cardAcquisitions = await this.cardAcquisitionRepository.find({
      where: { baasId: 'not set' },
    })
    return cardAcquisitions.map((cardAcquisition) =>
      this.mapper.toDomainEntity(cardAcquisition),
    )
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<CardAcquisitionProps>,
  ): FindOptionsOrder<CardAcquisitionOrmEntity> {
    const order: FindOptionsOrder<CardAcquisitionOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.externalId) {
      order.externalId = params.externalId
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<CardAcquisitionProps>,
  ): WhereCondition<CardAcquisitionOrmEntity> {
    const where: WhereCondition<CardAcquisitionOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.externalId) {
      where.externalId = params.externalId
    }
    if (params.status) {
      where.status = params.status
    }
    if (params.baasId) {
      where.baasId = params.baasId
    }
    return where
  }
}
