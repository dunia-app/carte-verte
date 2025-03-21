import _ from 'lodash'
import {
  DeepPartial,
  // FindConditions,
  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm'
import { NotFoundException } from '../../../../exceptions/index'
import { isUndefined } from '../../../../utils/is-undefined.util'
import { AggregateRoot } from '../../../domain/base-classes/aggregate-root.base'
import { DomainEvents } from '../../../domain/domain-events/index'
import { Logger } from '../../../domain/ports/logger.port'
import {
  DataWithCursorPaginationMeta,
  DataWithPaginationMeta,
  FindManyCursorPaginatedParams,
  FindManyPaginatedParams,
  OrderBy,
  QueryParams,
  RepositoryPort,
} from '../../../domain/ports/repository.ports'
import { UUID } from '../../../domain/value-objects/uuid.value-object'
import { OrmMapper } from './orm-mapper.base'
import { TypeormEntityBase } from './typeorm.entity.base'

export type WhereCondition<OrmEntity> =
  // | FindConditions<OrmEntity>[]
  // | FindConditions<OrmEntity>
  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  FindOptionsWhere<OrmEntity>[] | FindOptionsWhere<OrmEntity>

export abstract class TypeormRepositoryBase<
  Entity extends AggregateRoot<unknown>,
  EntityProps,
  OrmEntity extends TypeormEntityBase,
> implements RepositoryPort<Entity, EntityProps>
{
  paginationLimitMax: number = 500
  maxBatchSize: number = 1000
  protected constructor(
    protected readonly repository: Repository<OrmEntity>,
    protected readonly mapper: OrmMapper<Entity, OrmEntity>,
    protected readonly logger: Logger,
  ) {}

  /**
   * Specify relations to other tables.
   * For example: `relations = ['user', ...]`
   */
  protected abstract relations: string[]

  protected abstract prepareQuery(
    params: QueryParams<EntityProps>,
  ): WhereCondition<OrmEntity>

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  protected abstract orderQuery(
    params?: OrderBy<EntityProps>,
  ): FindOptionsOrder<OrmEntity>

  async save(entity: Entity): Promise<Entity> {
    entity.validate() // Protecting invariant before saving
    const ormEntity = this.mapper.toOrmEntity(entity) as DeepPartial<OrmEntity>
    const result = await this.repository.save(ormEntity)
    await DomainEvents.publishEvents(entity.id, this.logger, this.correlationId)
    this.logger.debug(
      `[${entity.constructor.name}] persisted ${entity.id.value}`,
    )
    return this.mapper.toDomainEntity(result)
  }

  async saveMultiple(
    entities: Entity[],
    batchSize: number = this.maxBatchSize,
  ): Promise<Entity[]> {
    const ormEntities = entities.map((entity) => {
      entity.validate()
      return this.mapper.toOrmEntity(entity)
    }) as DeepPartial<OrmEntity>[]
    const result = await this.repository.save(ormEntities, {
      chunk: Math.min(batchSize, this.maxBatchSize),
    })
    await DomainEvents.publishMultipleEvents(
      entities.map((entity) => entity.id),
      this.logger,
      this.correlationId,
    )
    if (entities.length > 0) {
      this.logger.debug(
        `[${entities[0].constructor.name}]: persisted ${entities.map(
          (entity) => entity.id.value,
        )}`,
      )
    }
    return result.map((entity) => this.mapper.toDomainEntity(entity))
  }

  async findOne(
    params: QueryParams<EntityProps> = {} as QueryParams<EntityProps>,
    relations: string[] = this.relations,
  ): Promise<Entity | undefined> {
    const where = this.prepareQuery(params)
    const found = await this.repository.findOne({
      where,
      relations: _.union(relations, this.relations),
    })
    return found ? this.mapper.toDomainEntity(found) : undefined
  }

  async findOneOrThrow(
    params: QueryParams<EntityProps> = {} as QueryParams<EntityProps>,
    relations: string[] = this.relations,
  ): Promise<Entity> {
    const found = await this.findOne(params, relations)
    if (!found) {
      throw new NotFoundException()
    }
    return found
  }

  async findOneById(
    id: UUID | string,
    relations: string[] = this.relations,
  ): Promise<Entity | undefined> {
    if (
      !id ||
      (id instanceof UUID && isUndefined(id.value)) ||
      isUndefined(id)
    ) {
      this.logger.error(
        `[${this.constructor.name}] findOneById called with empty id`,
      )
      return undefined
    }
    const found = await this.repository.findOne({
      where: {
        id: id instanceof UUID ? id.value : id,
      } as FindOptionsWhere<OrmEntity>,
      relations: _.union(relations, this.relations),
    })
    return found ? this.mapper.toDomainEntity(found) : undefined
  }

  async findOneByIdOrThrow(
    id: UUID | string,
    relations: string[] = this.relations,
  ): Promise<Entity> {
    if (
      !id ||
      (id instanceof UUID && isUndefined(id.value)) ||
      isUndefined(id)
    ) {
      this.logger.error(
        `[${this.constructor.name}] findOneByIdOrThrow called with empty id`,
      )
      throw new NotFoundException('FindOneByIdOrThrow called with empty id')
    }
    const found = await this.repository.findOne({
      where: {
        id: id instanceof UUID ? id.value : id,
      } as FindOptionsWhere<OrmEntity>,
      relations: _.union(relations, this.relations),
    })
    if (!found) {
      throw new NotFoundException()
    }
    return this.mapper.toDomainEntity(found)
  }

  async findMany(
    params: QueryParams<EntityProps> = {} as QueryParams<EntityProps>,
  ): Promise<Entity[]> {
    const result = await this.repository.find({
      where: this.prepareQuery(params),
      relations: _.union(this.relations),
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyById(
    ids: string[] | UUID[],
    relations: string[] = this.relations,
  ): Promise<Entity[]> {
    const result = await this.repository.find({
      where: {
        id: In(ids.map((id) => (id instanceof UUID ? id.value : id))),
      } as FindOptionsWhere<OrmEntity>,
      relations: _.union(relations, this.relations),
    })
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyPaginated(
    {
      params = {} as QueryParams<EntityProps>,
      pagination,
      orderBy,
    }: FindManyPaginatedParams<EntityProps>,
    relations: string[] = this.relations,
  ): Promise<DataWithPaginationMeta<Entity[]>> {
    const actualLimit = Math.max(
      Math.min(pagination?.limit || 20, this.paginationLimitMax),
      1,
    )
    const [data, count] = await this.repository.findAndCount({
      skip: pagination?.skip,
      take: actualLimit,
      where: this.prepareQuery(params),
      // order: orderBy,
      // for typeorm 0.0.3 once nestjs/typeorm is up to date
      order: this.orderQuery(orderBy),
      relations: _.union(relations, this.relations),
    })

    const result: DataWithPaginationMeta<Entity[]> = {
      data: data.map((item) => this.mapper.toDomainEntity(item)),
      count,
      limit: pagination?.limit,
      page: pagination?.page,
    }

    return result
  }

  // TO DO : cursor
  async findManyCursorPaginated(
    {
      params = {} as QueryParams<EntityProps>,
      pagination,
      orderBy,
    }: FindManyCursorPaginatedParams<EntityProps>,
    relations: string[] = this.relations,
  ): Promise<DataWithCursorPaginationMeta<Entity[]>> {
    const actualLimit = Math.max(
      Math.min(pagination?.limit || 20, this.paginationLimitMax),
      1,
    )
    const [data, count] = await this.repository.findAndCount({
      take: actualLimit,
      where: this.prepareQuery(params),
      // order: orderBy,
      // for typeorm 0.0.3 once nestjs/typeorm is up to date
      order: this.orderQuery(orderBy),
      relations: _.union(relations, this.relations),
    })

    const result: DataWithCursorPaginationMeta<Entity[]> = {
      data: data.map((item) => this.mapper.toDomainEntity(item)),
      count,
      before: undefined,
      after: undefined,
    }

    return result
  }

  async delete(entities: Entity[]): Promise<Entity[]> {
    const ormEntities = entities.map((entity) => {
      entity.validate()
      return this.mapper.toOrmEntity(entity) as OrmEntity
    })
    await this.repository.remove(ormEntities)

    await Promise.all(
      entities.map(async (entity) => {
        await DomainEvents.publishEvents(
          entity.id,
          this.logger,
          this.correlationId,
        )
        this.logger.debug(
          `[${entity.constructor.name}] deleted ${entity.id.value}`,
        )
      }),
    )
    return entities
  }

  async deleteById(id: UUID[] | string[]): Promise<Entity[]> {
    const entities = await this.findManyById(id)
    if (entities.length !== id.length) {
      throw new NotFoundException()
    }
    await this.delete(entities)
    return entities
  }

  protected correlationId?: string

  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId
    return this
  }
}
