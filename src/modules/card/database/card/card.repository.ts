import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsOrder,
  In,
  IsNull,
  MoreThan,
  Not,
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
import { CardEntity, CardProps } from '../../domain/entities/card.entity'
import { LockStatus } from '../../domain/entities/card.types'
import { CardOrmEntity } from './card.orm-entity'
import { CardOrmMapper } from './card.orm-mapper'
import { CardRepositoryPort } from './card.repository.port'

@Injectable()
export class CardRepository
  extends TypeormRepositoryBase<CardEntity, CardProps, CardOrmEntity>
  implements CardRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(CardOrmEntity)
    private readonly cardRepository: Repository<CardOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      cardRepository,
      new CardOrmMapper(CardEntity, CardOrmEntity, config),
      logger,
    )
  }

  private async findOneByExternalId(
    externalId: string,
  ): Promise<CardOrmEntity | null> {
    const card = await this.cardRepository.findOne({
      where: { externalId },
    })

    return card
  }

  async findOneByExternalIdOrThrow(externalId: string): Promise<CardEntity> {
    const card = await this.findOneByExternalId(externalId)
    if (!card) {
      throw new NotFoundException(
        `Card with externalId ${externalId} not found`,
      )
    }
    return this.mapper.toDomainEntity(card)
  }

  async findManyByExternalId(externalIds: string[]): Promise<CardEntity[]> {
    const cards = await this.cardRepository.find({
      where: {
        externalId: In(externalIds),
      },
    })

    return cards.map((card) => this.mapper.toDomainEntity(card))
  }

  private async findOneByPublicToken(
    publicToken: string,
  ): Promise<CardOrmEntity | null> {
    const card = await this.cardRepository.findOne({
      where: { publicToken },
    })

    return card
  }

  async findOneByPublicTokenOrThrow(publicToken: string): Promise<CardEntity> {
    const card = await this.findOneByPublicToken(publicToken)
    if (!card) {
      throw new NotFoundException(
        `Card with publicToken ${publicToken} not found`,
      )
    }
    return this.mapper.toDomainEntity(card)
  }

  private async findCurrentOneByEmployeeId(
    employeeId: string,
  ): Promise<CardOrmEntity | null> {
    const card = await this.cardRepository.findOne({
      where: [
        {
          employeeId,
          lockStatus: In([LockStatus.UNLOCK, LockStatus.LOCK]),
        },
      ],
    })

    return card
  }

  async findCurrentOneByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardEntity> {
    const card = await this.findCurrentOneByEmployeeId(employeeId)
    if (!card) {
      throw new NotFoundException(
        `Card with employeeId ${employeeId} not found`,
      )
    }
    return this.mapper.toDomainEntity(card)
  }

  async findManyPhysicalCardNotCoveredByEmployeeIds(
    employeeIds: string[],
  ): Promise<CardEntity[]> {
    const cards = await this.cardRepository.find({
      where: [
        {
          employeeId: In(employeeIds),
          physicalCardCoveredAt: IsNull(),
          physicalCardPriceToCover: MoreThan(0),
        },
      ],
    })

    return cards.map((card) => this.mapper.toDomainEntity(card))
  }

  async exists(employeeId: string): Promise<boolean> {
    const found = await this.findCurrentOneByEmployeeId(employeeId)
    if (found) {
      return true
    }
    return false
  }

  async findManyAfterCreatedAt(createdAt: Date): Promise<CardEntity[]> {
    const cards = await this.cardRepository.find({
      where: {
        createdAt: MoreThan(createdAt),
      },
    })

    return cards.map((card) => this.mapper.toDomainEntity(card))
  }

  async findManyPhysicalCardNotCovered(
    organizationId: string,
  ): Promise<CardEntity[]> {
    const subQuery = `
      SELECT 1
      FROM "meal_ticket_command" "mtc"
      WHERE "mtc"."organizationId" = :organizationId
        AND "mtc"."payedAt" IS NULL
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements("mtc"."mealTicketCountPerEmployee") elem
          WHERE (elem->>'employeeId')::uuid = "card"."employeeId"
            AND (elem->>'physicalCardToCover')::decimal > 0
        )
    `

    const cards = await this.repository
      .createQueryBuilder('card')
      .leftJoin('employee', 'employee', 'employee."id" = card."employeeId"')
      .where('employee."organizationId" = :organizationId', { organizationId })
      .andWhere('"physicalCardCoveredAt" IS NULL')
      .andWhere('"physicalCardPriceToCover" > 0')
      .andWhere(`NOT EXISTS (${subQuery})`)
      .setParameters({ organizationId })
      .getMany()

    return cards.map((card) => this.mapper.toDomainEntity(card))
  }

  countPhysicalCardByEmployeeId(employeeId: string): Promise<number> {
    return this.cardRepository.count({
      where: [
        {
          employeeId: employeeId,
          convertedToPhysicalAt: Not(IsNull()),
        },
      ],
    })
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<CardProps>,
  ): FindOptionsOrder<CardOrmEntity> {
    const order: FindOptionsOrder<CardOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.lockStatus) {
      order.lockStatus = params.lockStatus
    }
    if (params.blockedAt) {
      order.blockedAt = params.blockedAt
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<CardProps>,
  ): WhereCondition<CardOrmEntity> {
    const where: WhereCondition<CardOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.employeeId) {
      where.employeeId = params.employeeId.value
    }
    if (params.lockStatus) {
      where.lockStatus = params.lockStatus
    }
    return where
  }
}
