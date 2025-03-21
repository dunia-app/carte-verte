import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsOrder,
  In,
  IsNull,
  LessThan,
  Like,
  Not,
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
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import {
  MerchantOrganizationEntity,
  MerchantOrganizationProps,
} from '../../domain/entities/merchant-organization.entity'
import { MerchantOrganizationOrmEntity } from './merchant-organization.orm-entity'
import { MerchantOrganizationOrmMapper } from './merchant-organization.orm-mapper'
import {
  FindManyToInviteResult,
  FindNewToInviteResult,
  MerchantOrganizationRepositoryPort,
} from './merchant-organization.repository.port'
import moment = require('moment')

@Injectable()
export class MerchantOrganizationRepository
  extends TypeormRepositoryBase<
    MerchantOrganizationEntity,
    MerchantOrganizationProps,
    MerchantOrganizationOrmEntity
  >
  implements MerchantOrganizationRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(MerchantOrganizationOrmEntity)
    private readonly merchantOrganizationRepository: Repository<MerchantOrganizationOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantOrganizationRepository,
      new MerchantOrganizationOrmMapper(
        MerchantOrganizationEntity,
        MerchantOrganizationOrmEntity,
        config,
      ),
      logger,
    )
  }

  private async findOneBySiretOrm(
    siret: string,
  ): Promise<MerchantOrganizationOrmEntity | null> {
    const merchantOrganization =
      await this.merchantOrganizationRepository.findOne({
        where: { siret },
      })

    return merchantOrganization
  }

  async findOneBySiret(
    siret: string,
  ): Promise<MerchantOrganizationEntity | undefined> {
    const merchantOrganization = await this.findOneBySiretOrm(siret)

    return merchantOrganization
      ? this.mapper.toDomainEntity(merchantOrganization)
      : undefined
  }

  async findOneBySiretOrThrow(
    siret: string,
  ): Promise<MerchantOrganizationEntity> {
    const merchantOrganization = await this.findOneBySiretOrm(siret)
    if (!merchantOrganization) {
      throw new NotFoundException(
        `MerchantOrganization with siret '${siret}' not found`,
      )
    }
    return this.mapper.toDomainEntity(merchantOrganization)
  }

  async findOneBySiretOrSirenOrThrow(
    siret: string,
  ): Promise<MerchantOrganizationEntity> {
    const merchantOrganization = await this.merchantOrganizationRepository
      .createQueryBuilder()
      .where(
        '"MerchantOrganizationOrmEntity"."siret" = :siret OR LEFT("MerchantOrganizationOrmEntity"."siret", 9) = :siret',
        {
          siret: siret,
        },
      )
      .getMany()
    if (merchantOrganization.length !== 1) {
      throw new NotFoundException(
        `MerchantOrganization with siret '${siret}' not found`,
      )
    }
    return this.mapper.toDomainEntity(merchantOrganization[0])
  }

  async findOneBySiretOrSiren(
    siret: string,
  ): Promise<MerchantOrganizationEntity | undefined> {
    const merchantOrganization = await this.merchantOrganizationRepository
      .createQueryBuilder()
      .where(
        '"MerchantOrganizationOrmEntity"."siret" = :siret OR LEFT("MerchantOrganizationOrmEntity"."siret", 9) = :siret',
        {
          siret: siret,
        },
      )
      .getMany()
    if (merchantOrganization.length !== 1) {
      return undefined
    }
    return this.mapper.toDomainEntity(merchantOrganization[0])
  }

  async findManyBySiret(
    siret: string[],
  ): Promise<MerchantOrganizationEntity[]> {
    const result = await this.merchantOrganizationRepository.find({
      where: { siret: In(siret) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyToInvite(
    nbOfTransaction: number[],
    batchSize: number,
  ): Promise<FindManyToInviteResult[]> {
    let query = this.merchantOrganizationRepository
      .createQueryBuilder()
      .select(['"MerchantOrganizationOrmEntity".*', 'tr."nbTransaction"'])
      .leftJoin(
        'merchant_merchant_organization',
        'merchant_merchant_organization',
        'merchant_merchant_organization.siret = "MerchantOrganizationOrmEntity"."siret"',
      )
      .leftJoin(
        (qb) =>
          qb
            .select([
              '"merchantId"',
              'count(transaction."externalPaymentId") as "nbTransaction"',
            ])
            .from('transaction', 'transaction')
            .where(`"transaction"."status" = '${TransactionStatus.Settled}'`)
            .groupBy('"merchantId"'),
        'tr',
        'tr."merchantId" = "merchant_merchant_organization"."mid"',
      )
      .leftJoin(
        'mandate_siret',
        'mandate_siret',
        'mandate_siret.siret = "MerchantOrganizationOrmEntity"."siret"',
      )
      .leftJoin('mandate', 'mandate', 'mandate.id = mandate_siret."mandateId"')
      .where('"MerchantOrganizationOrmEntity"."email" IS NOT NULL')
      .andWhere(`"MerchantOrganizationOrmEntity"."email" <> ''`)
      .andWhere('mandate.id IS NULL')
      .andWhere('"MerchantOrganizationOrmEntity"."emailBouncedOn" IS NULL')
    let nbTransactionWhere: string = '('
    for (const nb of nbOfTransaction) {
      nbTransactionWhere += `(tr."nbTransaction" >= ${nb} AND "affiliationInvitationSent" < ${nb}) OR`
    }
    nbTransactionWhere = nbTransactionWhere.slice(0, -3) + ')'
    query = query.andWhere(nbTransactionWhere)

    return (await query.limit(batchSize).getRawMany()).map((res) => {
      return {
        merchant: this.mapper.toDomainEntity(res),
        nbTransaction: res.nbTransaction,
      }
    })
  }

  async findNewToInvite(
    dayCount: number[],
    batchSize: number,
  ): Promise<FindNewToInviteResult[]> {
    let query = this.merchantOrganizationRepository
      .createQueryBuilder()
      .select([
        '"MerchantOrganizationOrmEntity".*',
        'current_date - "MerchantOrganizationOrmEntity"."createdAt"::date AS "daySince"',
      ])
      .leftJoin(
        'mandate_siret',
        'mandate_siret',
        'mandate_siret.siret = "MerchantOrganizationOrmEntity"."siret"',
      )
      .leftJoin('mandate', 'mandate', 'mandate.id = mandate_siret."mandateId"')
      .where(
        'current_date - "MerchantOrganizationOrmEntity"."createdAt"::date = ANY(:dayCount)',
        { dayCount },
      )
      .andWhere('"MerchantOrganizationOrmEntity"."email" IS NOT NULL')
      .andWhere(`"MerchantOrganizationOrmEntity"."email" <> ''`)
      // Only invite new merchants in departments where we have organizations
      // to avoid too much mails
      .andWhere(
        'LEFT("MerchantOrganizationOrmEntity"."postalCode", 2) IN (SELECT DISTINCT LEFT(organization."postalCode", 2) FROM organization)',
      )
      .andWhere('mandate.id IS NULL')
      .andWhere('"MerchantOrganizationOrmEntity"."emailBouncedOn" IS NULL')

    return (await query.limit(batchSize).getRawMany()).map((res) => {
      return {
        merchant: this.mapper.toDomainEntity(res),
        daySince: res.daySince,
      }
    })
  }

  async exists(siret: string): Promise<boolean> {
    const found = await this.findOneBySiret(siret)
    if (found) {
      return true
    }
    return false
  }

  async isMidCntrRegistred(mid: string) {
    const midCntrRegistration = await this.repository
      .query(`SELECT merchant_organization."cntrRegistrationNumber"
      FROM "merchant_organization" "merchant_organization" 
      FULL JOIN "merchant_merchant_organization" "merchant_merchant_organization" 
      ON merchant_merchant_organization."siret" = "merchant_organization"."siret" 
      WHERE merchant_merchant_organization."mid" = '${mid}'
      LIMIT 1`)

    // check for easy to match merchant_organization
    const temporaryMerchant =
      midCntrRegistration.length === 0 &&
      mid.length === 15 &&
      mid.startsWith('*')
        ? await this.findOneBySiret(mid.slice(1))
        : undefined
    if (temporaryMerchant) {
      midCntrRegistration.push(temporaryMerchant)
    }
    return (
      midCntrRegistration[0] && !!midCntrRegistration[0].cntrRegistrationNumber
    )
  }

  async blankUpdate(
    organizationIdsToBlankUpdate: string[],
  ): Promise<number | undefined> {
    const unupdatedRegistrationRemoved = await this.repository.update(
      {
        id: In(organizationIdsToBlankUpdate),
      },
      {
        updatedAt: new Date(),
      },
    )
    return unupdatedRegistrationRemoved.affected
  }

  async removeUnupdatedRegistration(): Promise<number | undefined> {
    const unupdatedRegistrationRemoved = await this.repository.update(
      {
        updatedAt: LessThan(moment().subtract(1, 'day').toDate()),
      },
      {
        cntrRegistrationNumber: null,
        updatedAt: new Date(),
      },
    )
    return unupdatedRegistrationRemoved.affected
  }

  async findManyByCityExact(
    city: string,
  ): Promise<MerchantOrganizationEntity[]> {
    const formattedCity = `${city.toUpperCase().replace("'", "''")}`
    const result = await this.merchantOrganizationRepository.find({
      where: { city: formattedCity },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByCity(city: string): Promise<MerchantOrganizationEntity[]> {
    const formattedCity = `${city.toUpperCase().replace("'", "''")}%`
    const result = await this.merchantOrganizationRepository.find({
      where: { city: Like(formattedCity) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyActivatedByBatchNumber(
    batchSize: number,
    batchNumber: number,
  ): Promise<MerchantOrganizationEntity[]> {
    const result = await this.merchantOrganizationRepository.find({
      where: { cntrRegistrationNumber: Not(IsNull()) },
      order: { id: 'ASC' },
      take: batchSize,
      skip: batchNumber * batchSize,
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  // Utility function to generate the similarity expression
  getSimilarityExpression(column: string, param: string): string {
    const commonNames = [
      'sas',
      'sarl',
      'sasu',
      'eurl',
      'sa',
      'resto',
      'bistro',
      'boulangerie',
      'la',
      'le',
      'de',
      'les',
      'bio',
      'sur',
      'et',
      'du',
      'en',
      'restaurant',
      'cafe',
      'des',
      'saint',
      'st',
      'chez',
      'pizza',
    ]

    const commandNamesRegex = commonNames.join('|')

    return `
    COALESCE(SIMILARITY(
      UNACCENT(LOWER(translate(${column}, ', -''', ''))),
      UNACCENT(LOWER(translate(:${param}, ', -''', '')))
    ), 0)
  `
  }

  async findManyByMerchantNameAndCityName(
    merchantName: string,
    cityName: string,
    nameThreshold: number,
  ): Promise<MerchantOrganizationEntity[]> {
    const brandNameColumn = '"MerchantOrganizationOrmEntity"."brandName"'
    const organizationNameColumn =
      '"MerchantOrganizationOrmEntity"."organizationName"'

    const brandNameSimilarityExpr = this.getSimilarityExpression(
      brandNameColumn,
      'merchantName',
    )
    const organizationNameSimilarityExpr = this.getSimilarityExpression(
      organizationNameColumn,
      'merchantName',
    )

    const similarityScoresQuery = this.merchantOrganizationRepository
      .createQueryBuilder()
      .select('"MerchantOrganizationOrmEntity".id', 'id')
      .addSelect(
        `GREATEST(${organizationNameSimilarityExpr}, ${brandNameSimilarityExpr})`,
        'name_similarity',
      )

    const finalQuery = this.merchantOrganizationRepository
      .createQueryBuilder()
      .addSelect('scores.name_similarity', 'name_similarity')
      .innerJoin(
        `(${similarityScoresQuery.getQuery()})`,
        'scores',
        '"MerchantOrganizationOrmEntity".id = scores.id',
      )
      .where(
        'LOWER("MerchantOrganizationOrmEntity".city) LIKE LOWER(:cityName || \'%\')',
      )
      .andWhere('scores.name_similarity > :nameThreshold')
      .orderBy('scores.name_similarity', 'DESC')
      .setParameters({
        merchantName,
        cityName,
        nameThreshold,
      })
      .limit(2)

    const result = await finalQuery.getMany()

    if (!result) {
      return []
    }

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<MerchantOrganizationProps>,
  ): FindOptionsOrder<MerchantOrganizationOrmEntity> {
    const order: FindOptionsOrder<MerchantOrganizationOrmEntity> = {}
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
    params: QueryParams<MerchantOrganizationProps>,
  ): WhereCondition<MerchantOrganizationOrmEntity> {
    const where: WhereCondition<MerchantOrganizationOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.siret) {
      where.siret = params.siret
    }
    return where
  }
}
