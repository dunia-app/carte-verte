import { BaseEntityProps } from '../base-classes/entity.base'
import { UUID } from '../value-objects/uuid.value-object'

/*  Most of repositories will probably need generic 
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific interfaces should be defined
    in a respective module/use case.
*/

export type QueryParams<EntityProps> = Partial<BaseEntityProps & EntityProps>

export interface Save<Entity> {
  save(entity: Entity): Promise<Entity>
}

export interface SaveMultiple<Entity> {
  saveMultiple(entities: Entity[], batchSize?: number): Promise<Entity[]>
}

export interface FindOne<Entity, EntityProps> {
  findOne(params: QueryParams<EntityProps>): Promise<Entity | undefined>
  findOneOrThrow(params: QueryParams<EntityProps>): Promise<Entity>
}

export interface FindOneById<Entity> {
  findOneById(id: UUID | string): Promise<Entity | undefined>
  findOneByIdOrThrow(id: UUID | string): Promise<Entity>
}

export interface FindMany<Entity, EntityProps> {
  findMany(params: QueryParams<EntityProps>): Promise<Entity[]>
}

export interface FindManyById<Entity> {
  findManyById(ids: UUID[] | string[]): Promise<Entity[]>
}

// export interface OrderBy {
//   [key: number]: -1 | 1
// }

// for typeorm 0.0.3 once nestjs/typeorm is up to date
export type OrderBy<EntityProps> = {
  [key in keyof QueryParams<EntityProps>]?: 'ASC' | 'DESC' | 1 | -1
}

export interface PaginationMeta {
  skip?: number
  limit?: number
  page?: number
}

export interface FindManyPaginatedParams<EntityProps> {
  params?: QueryParams<EntityProps>
  pagination?: PaginationMeta
  // orderBy?: OrderBy
  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  orderBy?: OrderBy<EntityProps>
}

export interface DataWithPaginationMeta<T> {
  data: T
  count: number
  limit?: number
  page?: number
}

export interface FindManyPaginated<Entity, EntityProps> {
  findManyPaginated(
    options: FindManyPaginatedParams<EntityProps>,
  ): Promise<DataWithPaginationMeta<Entity[]>>
}

export interface CursorPaginationMeta {
  cursor?: string
  limit?: number
}

export interface FindManyCursorPaginatedParams<EntityProps> {
  params?: QueryParams<EntityProps>
  pagination?: CursorPaginationMeta
  // orderBy?: OrderBy
  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  orderBy?: OrderBy<EntityProps>
}

export interface DataWithCursorPaginationMeta<T> {
  data: T
  count: number
  before?: string
  after?: string
}

export interface FindManyCursorPaginated<Entity, EntityProps> {
  findManyCursorPaginated(
    options: FindManyCursorPaginatedParams<EntityProps>,
  ): Promise<DataWithCursorPaginationMeta<Entity[]>>
}

export interface DeleteMany<Entity> {
  delete(entity: Entity[]): Promise<Entity[]>
}

export interface DeleteOneById<Entity> {
  deleteById(id: UUID[] | string[]): Promise<Entity[]>
}

export interface RepositoryPort<Entity, EntityProps>
  extends Save<Entity>,
    FindOne<Entity, EntityProps>,
    FindOneById<Entity>,
    FindMany<Entity, EntityProps>,
    FindManyById<Entity>,
    FindManyPaginated<Entity, EntityProps>,
    FindManyCursorPaginated<Entity, EntityProps>,
    DeleteMany<Entity>,
    DeleteOneById<Entity>,
    SaveMultiple<Entity> {
  setCorrelationId(correlationId: string): this
}
