import { INestApplication } from '@nestjs/common'
import { removeUndefinedProps } from '../../../utils/remove-undefined-props.util'
import { TypeormEntityBase } from '../../infrastructure/database/base-classes/typeorm.entity.base'
import { TypeormRepositoryBase } from '../../infrastructure/database/base-classes/typeorm.repository.base'
import { RepositoryPort } from '../ports/repository.ports'
import { AggregateRoot } from './aggregate-root.base'

export abstract class BaseFactory<
  T extends AggregateRoot<unknown>,
  K,
  R extends TypeormRepositoryBase<T, unknown, ormEntity>,
  ormEntity extends TypeormEntityBase = TypeormEntityBase,
> {
  static buildOne<T, K>(defaultData = {} as K): T {
    return this.prototype.buildOne(defaultData)
  }

  static buildMany<T, K>(amount = 1, defaultData = {} as K): T[] {
    return this.prototype.buildItems(amount, defaultData)
  }

  static saveOne<T, K>(
    app: INestApplication,
    defaultData = {} as K,
  ): Promise<T> {
    const newEntity = this.buildOne(defaultData)
    return this.prototype.getRepo(app).save(newEntity)
  }

  static saveMany<T, K>(
    app: INestApplication,
    amount = 1,
    defaultData = {} as K,
  ): Promise<T[]> {
    const newEntities = this.buildMany(amount, defaultData)
    return this.prototype.getRepo(app).saveMultiple(newEntities)
  }

  static saveOneRepo<T, K, R extends RepositoryPort<T, unknown>>(
    repo: R,
    defaultData = {} as K,
  ): Promise<T> {
    const newEntity: T = this.buildOne(defaultData)
    return repo.save(newEntity)
  }

  static saveManyRepo<
    T extends AggregateRoot<unknown>,
    K,
    R extends RepositoryPort<T, unknown>,
  >(repo: R, amount = 1, defaultData = {} as K): Promise<T[]> {
    const newEntities: T[] = this.buildMany(amount, defaultData)
    return repo.saveMultiple(newEntities)
  }

  protected buildItems(amount: number, data: K) {
    const items: T[] = []
    for (let i = 0; i < amount; i++) {
      items.push(this.buildOne(data))
    }
    return items
  }

  protected abstract buildEntity(defaultData: K): T

  protected abstract getRepo(app: INestApplication): R

  buildOne(defaultData = {} as K): T {
    const props = removeUndefinedProps(defaultData)
    return this.buildEntity(props as K)
  }
  buildMany(amount = 1, defaultData = {} as K): T[] {
    const props = removeUndefinedProps(defaultData)
    return this.buildItems(amount, props as K)
  }

  saveOne(app: INestApplication, defaultData = {} as K): Promise<T> {
    const newEntity = this.buildOne(defaultData)
    return this.getRepo(app).save(newEntity)
  }

  saveMany(
    app: INestApplication,
    amount = 1,
    defaultData = {} as K,
  ): Promise<T[]> {
    const newEntities = this.buildMany(amount, defaultData)
    return this.getRepo(app).saveMultiple(newEntities)
  }

  saveOneRepo(repo: R, defaultData = {} as K): Promise<T> {
    const newEntity = this.buildOne(defaultData)
    return repo.save(newEntity)
  }

  saveManyRepo(repo: R, amount = 1, defaultData = {} as K): Promise<T[]> {
    const newEntities = this.buildMany(amount, defaultData)
    return repo.saveMultiple(newEntities)
  }
}
