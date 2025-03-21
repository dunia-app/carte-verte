import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, Repository } from 'typeorm'
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
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  UserEntity,
  UserProps,
} from '../../../../modules/user/domain/entities/user.entity'
import { UserOrmEntity } from './user.orm-entity'
import { UserOrmMapper } from './user.orm-mapper'
import { UserRepositoryPort } from './user.repository.port'

@Injectable()
export class UserRepository
  extends TypeormRepositoryBase<UserEntity, UserProps, UserOrmEntity>
  implements UserRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      userRepository,
      new UserOrmMapper(UserEntity, UserOrmEntity, config),
      logger,
    )
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<UserProps>,
  ): FindOptionsOrder<UserOrmEntity> {
    const order: FindOptionsOrder<UserOrmEntity> = {}
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
    params: QueryParams<UserProps>,
  ): WhereCondition<UserOrmEntity> {
    const where: WhereCondition<UserOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.name?.firstname) {
      where.firstname = params.name.firstname
    }
    if (params.name?.lastname) {
      where.lastname = params.name.lastname
    }
    return where
  }
}
