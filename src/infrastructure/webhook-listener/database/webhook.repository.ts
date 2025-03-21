import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOptionsOrder, IsNull, Repository } from 'typeorm'
import { logger } from '../../../helpers/application.helper'
import {
  OrderBy,
  QueryParams,
} from '../../../libs/ddd/domain/ports/repository.ports'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../libs/exceptions/index'
import { isUndefined } from '../../../libs/utils/is-undefined.util'
import { ConfigService } from '../../config/config.service'
import { WebhookEntity, WebhookProps } from '../entity/webhook.entity'
import { WebhookOrmEntity } from './webhook.orm-entity'
import { WebhookOrmMapper } from './webhook.orm-mapper'
import { WebhookRepositoryPort } from './webhook.repository.port'

@Injectable()
export class WebhookRepository
  extends TypeormRepositoryBase<
    WebhookEntity<any>,
    WebhookProps<any>,
    WebhookOrmEntity
  >
  implements WebhookRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(WebhookOrmEntity)
    private readonly webhookRepository: Repository<WebhookOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      webhookRepository,
      new WebhookOrmMapper(WebhookEntity, WebhookOrmEntity, config),
      logger,
    )
  }

  private async findOneByExternalId(
    externalId: string,
    source: string,
  ): Promise<WebhookOrmEntity | null> {
    const webhook = await this.webhookRepository.findOne({
      where: { externalId, source },
    })

    return webhook
  }

  async findOneByExternalIdOrThrow(
    externalId: string,
    source: string,
  ): Promise<WebhookEntity<any>> {
    const webhook = await this.findOneByExternalId(externalId, source)
    if (!webhook) {
      throw new NotFoundException(
        `Webhook with externalId '${externalId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(webhook)
  }

  async exists(externalId: string, source: string): Promise<boolean> {
    const found = await this.findOneByExternalId(externalId, source)
    if (found) {
      return true
    }
    return false
  }

  private getManyToHandleWhere(
    source?: string,
  ): FindManyOptions<WebhookOrmEntity> {
    return {
      where: { source, handledAt: IsNull() },
    }
  }

  async findManyToHandleCount(source?: string): Promise<number> {
    return this.repository.count(this.getManyToHandleWhere(source))
  }

  async findManyToHandle(
    batchSize: number,
    source?: string,
  ): Promise<WebhookEntity<any>[]> {
    const webhooks = await this.webhookRepository.find({
      ...this.getManyToHandleWhere(source),
      take: batchSize,
      order: { externalCreatedAt: 'ASC' },
    })

    return webhooks.map((webhook) => this.mapper.toDomainEntity(webhook))
  }

  // Used to order a query
  protected orderQuery(
    params: OrderBy<WebhookProps<any>>,
  ): FindOptionsOrder<WebhookOrmEntity> {
    const order: FindOptionsOrder<WebhookOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.id) {
      order.id = params.id
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
    params: QueryParams<WebhookProps<any>>,
  ): WhereCondition<WebhookOrmEntity> {
    const where: WhereCondition<WebhookOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.externalId) {
      where.externalId = params.externalId
    }
    if (params.source) {
      where.source = params.source
    }
    if (params.handledAt) {
      where.handledAt = params.handledAt.value
    }
    return where
  }
}
