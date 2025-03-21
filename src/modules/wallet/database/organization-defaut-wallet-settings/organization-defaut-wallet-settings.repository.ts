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
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  OrganizationDefautWalletSettingsEntity,
  OrganizationDefautWalletSettingsProps,
} from '../../domain/entities/organization-defaut-wallet-settings.entity'
import { OrganizationDefautWalletSettingsOrmEntity } from './organization-defaut-wallet-settings.orm-entity'
import { OrganizationDefautWalletSettingsOrmMapper } from './organization-defaut-wallet-settings.orm-mapper'
import { OrganizationDefautWalletSettingsRepositoryPort } from './organization-defaut-wallet-settings.repository.port'

@Injectable()
export class OrganizationDefautWalletSettingsRepository
  extends TypeormRepositoryBase<
    OrganizationDefautWalletSettingsEntity,
    OrganizationDefautWalletSettingsProps,
    OrganizationDefautWalletSettingsOrmEntity
  >
  implements OrganizationDefautWalletSettingsRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(OrganizationDefautWalletSettingsOrmEntity)
    private readonly organizationDefautWalletSettingsRepository: Repository<OrganizationDefautWalletSettingsOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      organizationDefautWalletSettingsRepository,
      new OrganizationDefautWalletSettingsOrmMapper(
        OrganizationDefautWalletSettingsEntity,
        OrganizationDefautWalletSettingsOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationDefautWalletSettingsOrmEntity | null> {
    const wallet =
      await this.organizationDefautWalletSettingsRepository.findOne({
        where: { organizationId },
      })

    return wallet
  }

  async findOneByOrganizationIdOrThrow(
    organizationId: string,
  ): Promise<OrganizationDefautWalletSettingsEntity> {
    const wallet = await this.findOneByOrganizationId(organizationId)
    if (!wallet) {
      throw new NotFoundException(
        `OrganizationDefautWalletSettings with organizationId '${organizationId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(wallet)
  }

  async exists(organizationId: string): Promise<boolean> {
    const found = await this.findOneByOrganizationId(organizationId)
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<OrganizationDefautWalletSettingsProps>,
  ): FindOptionsOrder<OrganizationDefautWalletSettingsOrmEntity> {
    const order: FindOptionsOrder<OrganizationDefautWalletSettingsOrmEntity> =
      {}
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
    params: QueryParams<OrganizationDefautWalletSettingsProps>,
  ): WhereCondition<OrganizationDefautWalletSettingsOrmEntity> {
    const where: WhereCondition<OrganizationDefautWalletSettingsOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.organizationId) {
      where.organizationId = params.organizationId.value
    }
    return where
  }
}
