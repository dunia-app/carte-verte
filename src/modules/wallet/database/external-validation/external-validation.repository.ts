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
  ExternalValidationEntity,
  ExternalValidationProps,
} from '../../../../modules/wallet/domain/entities/external-validation.entity'
import { ExternalValidationOrmEntity } from './external-validation.orm-entity'
import { ExternalValidationOrmMapper } from './external-validation.orm-mapper'
import { ExternalValidationRepositoryPort } from './external-validation.repository.port'

@Injectable()
export class ExternalValidationRepository
  extends TypeormRepositoryBase<
    ExternalValidationEntity,
    ExternalValidationProps,
    ExternalValidationOrmEntity
  >
  implements ExternalValidationRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(ExternalValidationOrmEntity)
    private readonly externalValidationRepository: Repository<ExternalValidationOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      externalValidationRepository,
      new ExternalValidationOrmMapper(
        ExternalValidationEntity,
        ExternalValidationOrmEntity,
        config,
      ),
      logger,
    )
  }

  async exists(authorizationIssuerId: string): Promise<boolean> {
    const found = await this.findOneByAuthorizationIssuerId(
      authorizationIssuerId,
    )
    if (found) {
      return true
    }
    return false
  }

  async findOneByAuthorizationIssuerId(
    authorizationIssuerId: string,
  ): Promise<ExternalValidationEntity | undefined> {
    const externalValidation = await this.externalValidationRepository.findOne({
      where: { authorizationIssuerId },
    })

    return externalValidation
      ? this.mapper.toDomainEntity(externalValidation)
      : undefined
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<ExternalValidationProps>,
  ): FindOptionsOrder<ExternalValidationOrmEntity> {
    const order: FindOptionsOrder<ExternalValidationOrmEntity> = {}
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
    params: QueryParams<ExternalValidationProps>,
  ): WhereCondition<ExternalValidationOrmEntity> {
    const where: WhereCondition<ExternalValidationOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.authorizationIssuerId) {
      where.authorizationIssuerId = params.authorizationIssuerId
    }
    return where
  }
}
