import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import _ from 'lodash'
import { FindOptionsOrder, In, Repository } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { objectArrayToMap } from '../../../../helpers/object.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import {
  ReceiverEntity,
  ReceiverProps,
} from '../../../../modules/message/domain/entities/receiver.entity'
import { ReceiverOrmEntity } from './receiver.orm-entity'
import { ReceiverOrmMapper } from './receiver.orm-mapper'
import { ReceiverRepositoryPort } from './receiver.repository.port'

@Injectable()
export class ReceiverRepository
  extends TypeormRepositoryBase<
    ReceiverEntity,
    ReceiverProps,
    ReceiverOrmEntity
  >
  implements ReceiverRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(ReceiverOrmEntity)
    private readonly receiverRepository: Repository<ReceiverOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      receiverRepository,
      new ReceiverOrmMapper(ReceiverEntity, ReceiverOrmEntity, config),
      logger,
    )
  }

  private async findOneByUserId(
    userId: string,
  ): Promise<ReceiverOrmEntity | null> {
    const receiver = await this.receiverRepository.findOne({
      where: { userId },
    })

    return receiver
  }

  async findOneByUserIdOrThrow(userId: string): Promise<ReceiverEntity> {
    const receiver = await this.findOneByUserId(userId)
    if (!receiver) {
      throw new NotFoundException(`Receiver with userId '${userId}' not found`)
    }
    return this.mapper.toDomainEntity(receiver)
  }

  async findManyByUserIds(userIds: string[]): Promise<ReceiverEntity[]> {
    const result = await this.receiverRepository.find({
      where: { userId: In(userIds) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  private async findOneByEmployeeId(
    employeeId: string,
  ): Promise<ReceiverOrmEntity | null> {
    const receiver = await this.receiverRepository
      .createQueryBuilder()
      .leftJoin(
        'employee',
        'employee',
        'employee."userId" = "ReceiverOrmEntity"."userId"',
      )
      .where('employee."id" = :employeeId', {
        employeeId: employeeId,
      })
      .getOne()

    return receiver
  }

  async findOneByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<ReceiverEntity> {
    const receiver = await this.findOneByEmployeeId(employeeId)
    if (!receiver) {
      throw new NotFoundException(
        `Receiver with employeeId '${employeeId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(receiver)
  }

  async findManyByOrganizationId(
    organizationId: string,
    includeEmployee: boolean = true,
    includeAdmin: boolean = false,
  ): Promise<ReceiverEntity[]> {
    if (!includeEmployee && !includeAdmin) return []
    let query = this.receiverRepository.createQueryBuilder()
    if (includeEmployee) {
      query = query
        .leftJoin(
          'employee',
          'employee',
          'employee."userId" = "ReceiverOrmEntity"."userId"',
        )
        .where('employee."organizationId" = :organizationId', {
          organizationId: organizationId,
        })
    }
    if (includeAdmin) {
      query = query
        .leftJoin(
          'organization_admin',
          'organization_admin',
          '"organization_admin"."userId" = "ReceiverOrmEntity"."userId"',
        )
        .leftJoin(
          'organization_admins_organizations',
          'oao',
          'oao."adminId" = organization_admin.id',
        )
        .where('oao."organizationId" = :organizationId', {
          organizationId: organizationId,
        })
    }
    const receiver = await query.getMany()

    return receiver.map((item) => this.mapper.toDomainEntity(item))
  }

  private async findOneByEmailOrm(
    email: string,
  ): Promise<ReceiverOrmEntity | null> {
    const formattedEmail = new Email(email)
    const receiver = await this.receiverRepository.findOne({
      where: { email: formattedEmail.value },
    })

    return receiver
  }

  async findOneByEmail(email: string): Promise<ReceiverEntity | undefined> {
    const receiver = await this.findOneByEmailOrm(email)
    if (!receiver) {
      return
    }
    return this.mapper.toDomainEntity(receiver)
  }

  async findOneByEmailOrThrow(email: string): Promise<ReceiverEntity> {
    const receiver = await this.findOneByEmailOrm(email)
    if (!receiver) {
      throw new NotFoundException(`Receiver with email '${email}' not found`)
    }
    return this.mapper.toDomainEntity(receiver)
  }

  async findManyByEmails(emails: string[]): Promise<ReceiverEntity[]> {
    const result = await this.receiverRepository.find({
      where: { email: In(emails) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async exists(email: string): Promise<boolean> {
    const found = await this.findOneByEmailOrm(email)
    if (found) {
      return true
    }
    return false
  }

  async getFindManyByIdMapById(
    receiverIds: string[],
  ): Promise<Map<string, ReceiverEntity>> {
    const receivers = await this.findManyById(receiverIds)
    return objectArrayToMap(receivers, 'id', (it) => it.id.value)
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<ReceiverProps>,
  ): FindOptionsOrder<ReceiverOrmEntity> {
    const order: FindOptionsOrder<ReceiverOrmEntity> = {}
    if (_.isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<ReceiverProps>,
  ): WhereCondition<ReceiverOrmEntity> {
    const where: WhereCondition<ReceiverOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.userId) {
      where.userId = params.userId.value
    }
    if (params.email) {
      where.email = params.email.value
    }
    if (params.acceptEmail) {
      where.acceptEmail = params.acceptEmail
    }
    if (params.acceptNotification) {
      where.acceptNotification = params.acceptNotification
    }
    return where
  }
}
