import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, Repository } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { objectArrayToMap } from '../../../../helpers/object.helper'
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
  MessageEntity,
  MessageProps,
} from '../../domain/entities/message.entity'
import { MessageOrmEntity } from './message.orm-entity'
import { MessageOrmMapper } from './message.orm-mapper'
import { MessageRepositoryPort } from './message.repository.port'

@Injectable()
export class MessageRepository
  extends TypeormRepositoryBase<MessageEntity, MessageProps, MessageOrmEntity>
  implements MessageRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly messageRepository: Repository<MessageOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      messageRepository,
      new MessageOrmMapper(MessageEntity, MessageOrmEntity, config),
      logger,
    )
  }

  private async findOneByReceiverId(
    receiverId: string,
  ): Promise<MessageOrmEntity | null> {
    const message = await this.messageRepository.findOne({
      where: { receiverId },
    })

    return message
  }

  async findOneByReceiverIdOrThrow(receiverId: string): Promise<MessageEntity> {
    const message = await this.findOneByReceiverId(receiverId)
    if (!message) {
      throw new NotFoundException(
        `Message with receiverId '${receiverId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(message)
  }

  async getFindManyByIdMapById(
    messageIds: string[],
  ): Promise<Map<string, MessageEntity>> {
    const messages = await this.findManyById(messageIds)
    return objectArrayToMap(messages, 'id', (it) => it.id.value)
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<MessageProps>,
  ): FindOptionsOrder<MessageOrmEntity> {
    const order: FindOptionsOrder<MessageOrmEntity> = {}
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
    params: QueryParams<MessageProps>,
  ): WhereCondition<MessageOrmEntity> {
    const where: WhereCondition<MessageOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.receiverId) {
      where.receiverId = params.receiverId.value
    }
    if (params.templateName) {
      where.templateName = params.templateName
    }
    return where
  }
}
