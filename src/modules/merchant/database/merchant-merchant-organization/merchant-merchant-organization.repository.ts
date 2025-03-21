import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, In, MoreThan, Repository } from 'typeorm'
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
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationProps,
} from '../../domain/entities/merchant-merchant-organization.entity'
import { AdvantageForm } from '../../domain/entities/merchant.types'
import { MerchantMerchantOrganizationOrmEntity } from './merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationOrmMapper } from './merchant-merchant-organization.orm-mapper'
import { MerchantMerchantOrganizationRepositoryPort } from './merchant-merchant-organization.repository.port'

/**
 * MerchantMerchantOrganizationRepository is a repository that manages the persistence of MerchantMerchantOrganization entities.
 * It extends the TypeormRepositoryBase base class and implements the MerchantMerchantOrganizationRepositoryPort interface.
 * It provides methods for finding, inserting, and updating MerchantMerchantOrganization entities.
 *
 * @module MerchantMerchantOrganizationRepository
 */
@Injectable()
export class MerchantMerchantOrganizationRepository
  extends TypeormRepositoryBase<
    MerchantMerchantOrganizationEntity,
    MerchantMerchantOrganizationProps,
    MerchantMerchantOrganizationOrmEntity
  >
  implements MerchantMerchantOrganizationRepositoryPort
{
  /**
   * The relations to be loaded with each query.
   */
  protected relations: string[] = []

  /**
   * Constructs a new MerchantMerchantOrganizationRepository.
   *
   * @param merchantMerchantOrganizationRepository - The Repository instance for managing MerchantMerchantOrganizationOrmEntity operations.
   * @param config - The ConfigService instance for accessing the application configuration.
   */ constructor(
    @InjectRepository(MerchantMerchantOrganizationOrmEntity)
    private readonly merchantMerchantOrganizationRepository: Repository<MerchantMerchantOrganizationOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantMerchantOrganizationRepository,
      new MerchantMerchantOrganizationOrmMapper(
        MerchantMerchantOrganizationEntity,
        MerchantMerchantOrganizationOrmEntity,
        config,
      ),
      logger,
    )
  }

  /**
   * Finds a MerchantMerchantOrganizationOrmEntity by its mid.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationOrmEntity.
   * @returns The MerchantMerchantOrganizationOrmEntity if found, null otherwise.
   */
  private async findOneByMidOrm(
    mid: string,
  ): Promise<MerchantMerchantOrganizationOrmEntity | null> {
    const merchantMerchantOrganization =
      await this.merchantMerchantOrganizationRepository.findOne({
        where: { mid },
      })

    return merchantMerchantOrganization
  }

  /**
   * Finds a MerchantMerchantOrganizationEntity by its mid.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @returns The MerchantMerchantOrganizationEntity if found, undefined otherwise.
   */
  async findOneByMid(
    mid: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined> {
    const merchantMerchantOrganization = await this.findOneByMidOrm(mid)
    if (!merchantMerchantOrganization) {
      return
    }
    return this.mapper.toDomainEntity(merchantMerchantOrganization)
  }

  /**
   * Finds a MerchantMerchantOrganizationEntity by its mid. Throws an exception if not found.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @returns The MerchantMerchantOrganizationEntity.
   * @throws NotFoundException if the MerchantMerchantOrganizationEntity is not found.
   */
  async findOneByMidOrThrow(
    mid: string,
  ): Promise<MerchantMerchantOrganizationEntity> {
    const merchantMerchantOrganization = await this.findOneByMidOrm(mid)
    if (!merchantMerchantOrganization) {
      throw new NotFoundException(
        `MerchantMerchantOrganization with mid '${mid}' not found`,
      )
    }
    return this.mapper.toDomainEntity(merchantMerchantOrganization)
  }

  /**
   * Finds a MerchantMerchantOrganizationEntity by its mid and merchantName.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @param merchantName - The merchantName of the MerchantMerchantOrganizationEntity.
   * @returns The MerchantMerchantOrganizationEntity if found, undefined otherwise.
   */
  async findOneByMidAndMerchantName(
    mid: string,
    merchantName: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined> {
    const merchantMerchantOrganization =
      await this.merchantMerchantOrganizationRepository.findOne({
        where: { mid, merchantName },
      })
    if (!merchantMerchantOrganization) {
      return
    }
    return this.mapper.toDomainEntity(merchantMerchantOrganization)
  }

  /**
   * Finds a MerchantMerchantOrganizationEntity by its mid, siret and merchantName.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @param siret - The siret of the MerchantMerchantOrganizationEntity.
   * @param merchantName - The merchantName of the MerchantMerchantOrganizationEntity.
   * @returns The MerchantMerchantOrganizationEntity if found, undefined otherwise.
   */
  async findOneByMidSiretAndMerchantName(
    mid: string,
    siret: string,
    merchantName: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined> {
    const merchantMerchantOrganization =
      await this.merchantMerchantOrganizationRepository.findOne({
        where: { mid, merchantName, siret },
      })
    if (!merchantMerchantOrganization) {
      return
    }
    return this.mapper.toDomainEntity(merchantMerchantOrganization)
  }

  /**
   * Finds a MerchantMerchantOrganizationOrmEntity by its siret.
   *
   * @param siret - The siret of the MerchantMerchantOrganizationOrmEntity.
   * @returns The MerchantMerchantOrganizationOrmEntity if found, null otherwise.
   */
  private async findOneBySiretOrm(
    siret: string,
  ): Promise<MerchantMerchantOrganizationOrmEntity | null> {
    const merchantMerchantOrganization =
      await this.merchantMerchantOrganizationRepository.findOne({
        where: { siret },
      })

    return merchantMerchantOrganization
  }

  /**
   * Finds a MerchantMerchantOrganizationEntity by its siret.
   *
   * @param siret - The siret of the MerchantMerchantOrganizationEntity.
   * @returns The MerchantMerchantOrganizationEntity if found, undefined otherwise.
   */
  async findOneBySiret(
    siret: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined> {
    const merchantMerchantOrganization = await this.findOneBySiretOrm(siret)
    if (!merchantMerchantOrganization) {
      return
    }
    return this.mapper.toDomainEntity(merchantMerchantOrganization)
  }

  /**
   * Checks if a MerchantMerchantOrganizationEntity exists by its mid.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @returns True if the MerchantMerchantOrganizationEntity exists, false otherwise.
   */
  async exists(
    mid: string,
    siret: string,
    merchantName: string,
  ): Promise<boolean> {
    const found = await this.findOneByMidSiretAndMerchantName(
      mid,
      siret,
      merchantName,
    )
    if (found) {
      return true
    }
    return false
  }

  /**
   * Finds many MerchantMerchantOrganizationEntity by their createdAt date.
   *
   * @param createdSince - The minimum createdAt date of the MerchantMerchantOrganizationEntity.
   * @returns An array of MerchantMerchantOrganizationEntity.
   */
  async findManyByCreatedAt(
    createdSince: Date,
  ): Promise<MerchantMerchantOrganizationEntity[]> {
    const result = await this.merchantMerchantOrganizationRepository
      .createQueryBuilder('mmo')
      .leftJoin(
        'merchant_organization',
        'merchant_organization',
        'merchant_organization."siret" = mmo.siret',
      )
      .where({ createdAt: MoreThan(createdSince) })
      .andWhere('"merchant_organization"."cntrRegistrationNumber" IS NOT NULL')
      .getMany()

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  /**
   * Finds many MerchantMerchantOrganizationEntity by their createdAt date and advantageForm.
   *
   * @param createdSince - The minimum createdAt date of the MerchantMerchantOrganizationEntity.
   * @param advantageForm - The advantageForm of the MerchantMerchantOrganizationEntity.
   * @returns An array of MerchantMerchantOrganizationEntity.
   */
  async findManyByCreatedAtAndAdvantage(
    createdSince: Date,
    advantageForm: AdvantageForm,
  ): Promise<MerchantMerchantOrganizationEntity[]> {
    const result = await this.merchantMerchantOrganizationRepository
      .createQueryBuilder('mmo')
      .leftJoin(
        'merchant_organization',
        'merchant_organization',
        'merchant_organization."siret" = mmo.siret',
      )
      .leftJoin('merchant', 'merchant', 'merchant."mid" = mmo.mid')
      .where({ createdAt: MoreThan(createdSince) })
      .andWhere('"merchant_organization"."cntrRegistrationNumber" IS NOT NULL')
      .andWhere('"merchant"."advantageForm" IS :advantageForm', {
        advantageForm,
      })
      .getMany()

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  /**
   * Finds many MerchantMerchantOrganizationEntity by their sirets.
   *
   * @param sirets - An array of sirets of the MerchantMerchantOrganizationEntity.
   * @returns An array of MerchantMerchantOrganizationEntity.
   */
  async findManyBySirets(
    sirets: string[],
  ): Promise<MerchantMerchantOrganizationEntity[]> {
    const result = await this.merchantMerchantOrganizationRepository.find({
      where: { siret: In(sirets) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  /**
   * Finds all MerchantMerchantOrganizationEntity by their merchantName.
   *
   * @param merchantName - The merchantName of the MerchantMerchantOrganizationEntity.
   * @returns An array of MerchantMerchantOrganizationEntity.
   */
  async findAllByMerchantName(
    merchantName: string,
  ): Promise<MerchantMerchantOrganizationEntity[]> {
    const result = await this.merchantMerchantOrganizationRepository.find({
      where: { merchantName },
    })
    if (!result) {
      return []
    }
    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  /**
   * Updates the mid of a MerchantMerchantOrganizationEntity.
   *
   * @param existingMid - The existing mid of the MerchantMerchantOrganizationEntity.
   * @param mid - The new mid of the MerchantMerchantOrganizationEntity.
   * @returns True if the update was successful, false otherwise.
   */
  async updateMid(existingMid: string, mid: string): Promise<boolean> {
    return this.merchantMerchantOrganizationRepository
      .update(
        {
          mid: existingMid,
        },
        {
          mid: mid,
        },
      )
      .catch((e) => {
        logger.warn(
          `[${this.constructor.name}] Error while updating MerchantMerchantOrganization, possibly a duplicate : ${e}`,
        )
        return false
      })
      .then(() => {
        return true
      })
  }

  /**
   * Upserts a new MerchantMerchantOrganizationEntity.
   *
   * @param mid - The mid of the MerchantMerchantOrganizationEntity.
   * @param merchantName - The merchantName of the MerchantMerchantOrganizationEntity.
   * @param matchedSiret - The matchedSiret of the MerchantMerchantOrganizationEntity.
   * @returns True if the insertion was successful, false otherwise.
   */
  async upsert(
    mid: string,
    merchantName: string,
    matchedSiret: string,
  ): Promise<boolean> {
    return this.merchantMerchantOrganizationRepository
      .createQueryBuilder()
      .insert()
      .into(MerchantMerchantOrganizationOrmEntity)
      .values([{ mid, merchantName, siret: matchedSiret }])
      .orIgnore()
      .execute()
      .then(() => {
        return true
      })
      .catch((e) => {
        logger.warn(
          `[${this.constructor.name}] Error while updating MerchantMerchantOrganization, possibly a duplicate : ${e}`,
        )
        return false
      })
  }

  /**
   * Orders a query by the provided parameters.
   *
   * @param params - The parameters by which to order the query.
   * @returns The ordered query.
   */
  protected orderQuery(
    params: OrderBy<MerchantMerchantOrganizationProps>,
  ): FindOptionsOrder<MerchantMerchantOrganizationOrmEntity> {
    const order: FindOptionsOrder<MerchantMerchantOrganizationOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.id) {
      order.id = params.id
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.mid) {
      order.mid = params.mid
    }
    return order
  }

  /**
   * Prepares a query by the provided parameters.
   *
   * @param params - The parameters by which to prepare the query.
   * @returns The prepared query.
   */
  protected prepareQuery(
    params: QueryParams<MerchantMerchantOrganizationProps>,
  ): WhereCondition<MerchantMerchantOrganizationOrmEntity> {
    const where: WhereCondition<MerchantMerchantOrganizationOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.mid) {
      where.mid = params.mid
    }
    return where
  }
}
