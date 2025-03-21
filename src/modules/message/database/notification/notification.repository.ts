import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  FindOptionsOrder,
  IsNull,
  LessThanOrEqual,
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
  NotificationEntity,
  NotificationProps,
} from '../../../../modules/message/domain/entities/notification.entity'
import { NotificationOrmEntity } from './notification.orm-entity'
import { NotificationOrmMapper } from './notification.orm-mapper'
import { NotificationRepositoryPort } from './notification.repository.port'

@Injectable()
export class NotificationRepository
  extends TypeormRepositoryBase<
    NotificationEntity,
    NotificationProps,
    NotificationOrmEntity
  >
  implements NotificationRepositoryPort
{
  protected relations: string[] = ['message']

  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly notificationRepository: Repository<NotificationOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      notificationRepository,
      new NotificationOrmMapper(
        NotificationEntity,
        NotificationOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByMessageId(
    messageId: string,
  ): Promise<NotificationOrmEntity | null> {
    const notification = await this.notificationRepository.findOne({
      where: { messageId },
    })

    return notification
  }

  async findOneByMessageIdOrThrow(
    messageId: string,
  ): Promise<NotificationEntity> {
    const notification = await this.findOneByMessageId(messageId)
    if (!notification) {
      throw new NotFoundException(
        `Notification with messageId '${messageId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(notification)
  }

  async exists(messageId: string): Promise<boolean> {
    const found = await this.findOneByMessageId(messageId)
    if (found) {
      return true
    }
    return false
  }

  private getMessagesToBeSentWhere(
    lessThanDate: Date,
  ): FindManyOptions<NotificationOrmEntity> {
    return {
      where: {
        sentAt: IsNull(),
        failedToSendAt: IsNull(),
        willSendAt: LessThanOrEqual(lessThanDate),
      },
    }
  }

  async messagesToBeSentCount(lessThanDate: Date): Promise<number> {
    return this.repository.count(this.getMessagesToBeSentWhere(lessThanDate))
  }

  async messagesToBeSent(
    lessThanDate: Date,
    batchSize: number = 5000,
  ): Promise<NotificationEntity[]> {
    const notifications = await this.repository.find({
      ...this.getMessagesToBeSentWhere(lessThanDate),
      take: batchSize,
    })
    return notifications.map((notification) =>
      this.mapper.toDomainEntity(notification),
    )
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<NotificationProps>,
  ): FindOptionsOrder<NotificationOrmEntity> {
    const order: FindOptionsOrder<NotificationOrmEntity> = {}
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
    params: QueryParams<NotificationProps>,
  ): WhereCondition<NotificationOrmEntity> {
    const where: WhereCondition<NotificationOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.messageId) {
      where.messageId = params.messageId.value
    }
    if (params.type) {
      where.type = params.type
    }
    if (params.willSendAt) {
      where.willSendAt = params.willSendAt.value
    }
    return where
  }
}
