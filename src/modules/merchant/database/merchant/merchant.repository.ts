import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsOrder,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import {
  CursorDirection,
  OrderName,
  buildCursorsFromItems,
  fromBase64,
} from '../../../../helpers/cursor.helper'
import { union } from '../../../../helpers/query.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import { Coords } from '../../../../libs/ddd/domain/value-objects/coordinates.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { CursorPaginationBase } from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  MerchantEntity,
  MerchantProps,
} from '../../domain/entities/merchant.entity'
import {
  AdvantageForm,
  PointOfSaleGradesType,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'
import {
  PointOfSaleResponse,
  PointOfSalesResponse,
} from '../../dtos/merchant.response.dto'
import { MerchantOrmEntity } from './merchant.orm-entity'
import { MerchantOrmMapper } from './merchant.orm-mapper'
import { MerchantRepositoryPort } from './merchant.repository.port'

const unknownLocationDefaultDistance = 150
const deliveryMinimumDistance = 3

@Injectable()
export class MerchantRepository
  extends TypeormRepositoryBase<
    MerchantEntity,
    MerchantProps,
    MerchantOrmEntity
  >
  implements MerchantRepositoryPort
{
  protected relations: string[] = ['merchantCategory']

  constructor(
    @InjectRepository(MerchantOrmEntity)
    private readonly merchantRepository: Repository<MerchantOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      merchantRepository,
      new MerchantOrmMapper(MerchantEntity, MerchantOrmEntity, config),
      logger,
    )
  }

  private async findOneByMidOrm(
    mid: string,
  ): Promise<MerchantOrmEntity | null> {
    const merchant = await this.merchantRepository.findOne({
      where: { mid: mid.trim() },
      relations: this.relations,
    })

    return merchant
  }

  async findOneByMid(mid: string): Promise<MerchantEntity | undefined> {
    const merchant = await this.findOneByMidOrm(mid)

    return merchant ? this.mapper.toDomainEntity(merchant) : undefined
  }

  async findOneByMidOrThrow(mid: string): Promise<MerchantEntity> {
    const merchant = await this.findOneByMidOrm(mid)
    if (!merchant) {
      throw new NotFoundException(`Merchant with mid '${mid}' not found`)
    }
    return this.mapper.toDomainEntity(merchant)
  }

  async findManyByMid(mid: string): Promise<MerchantEntity[]> {
    const result = await this.merchantRepository.find({
      where: { mid: mid.trim() },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByMids(mids: string[]): Promise<MerchantEntity[]> {
    const result = await this.merchantRepository.find({
      where: { mid: In(mids.map((mid) => mid.trim())) },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async isMidBlacklisted(mid: string): Promise<boolean> {
    const merchant = await this.findOneByMidOrm(mid)
    return merchant?.isBlacklisted || false
  }

  async exists(mid: string): Promise<boolean> {
    const found = await this.findOneByMid(mid)
    if (found) {
      return true
    }
    return false
  }

  async findOneForImpactOrThrow(
    id: string | UUID,
  ): Promise<PointOfSaleResponse> {
    const merchant = await this.findOneForImpact(id)
    if (!merchant) {
      throw new NotFoundException(`Merchant with id '${id}' not found`)
    }
    return merchant
  }

  async findManyForImpactCursorPaginatedAndCount(
    cursorPagination: CursorPaginationBase,
    coords: Coords,
    advantageForm: AdvantageForm[],
    pointOfSaleType: PointOfSaleType[],
    radius?: number,
  ): Promise<PointOfSalesResponse> {
    console.time('all')
    const tableName = 'merchant_location'
    const cursorRowName = `"${tableName}"."distance"`
    let query = this.findManyForImpact(
      tableName,
      coords,
      advantageForm,
      pointOfSaleType,
    ).orderBy(cursorRowName, 'ASC')

    let paginateOrder: OrderName = 'ASC'
    let filterValue: string
    let filter: string | undefined = undefined
    if (cursorPagination.cursor) {
      const decoded = fromBase64(cursorPagination.cursor)
      const [dirSign, value] = decoded.split(';')
      if (dirSign && value) {
        filterValue = value
        paginateOrder = dirSign === CursorDirection.BEFORE ? 'DESC' : 'ASC'
        filter =
          dirSign === CursorDirection.BEFORE
            ? `${cursorRowName} < :filterValue`
            : `${cursorRowName} > :filterValue`
        query = query
          .andWhere(filter, { filterValue })
          .orderBy(cursorRowName, paginateOrder)
      }
    }
    if (radius) {
      query.andWhere('distance::float <= :radius', {
        radius,
      })
    }
    const actualLimit = Math.max(Math.min(cursorPagination.limit || 20, 500), 1)

    console.time('query')
    const [merchants, count] = await Promise.all([
      query.clone().limit(actualLimit).getRawMany(),
      query.select('COUNT(*)').orderBy().limit(1).getRawOne(),
    ])
    console.timeEnd('query')

    console.time('cursor')
    const cursor = await buildCursorsFromItems(
      merchants,
      this.hasCursorDirectionHandler(
        coords,
        advantageForm,
        pointOfSaleType,
        CursorDirection.BEFORE,
        radius,
      ),
      this.hasCursorDirectionHandler(
        coords,
        advantageForm,
        pointOfSaleType,
        CursorDirection.AFTER,
        radius,
      ),
      'distance',
    )
    console.timeEnd('cursor')
    console.timeEnd('all')

    return {
      data: merchants.map((tr) => {
        tr.id = new UUID(tr.id)
        tr.createdAt = new DateVO(tr.createdAt)
        tr.updatedAt = new DateVO(tr.updatedAt)
        return new PointOfSaleResponse(tr)
      }),
      count: count.count,
      before: cursor.before,
      after: cursor.after,
    }
  }

  private hasCursorDirectionHandler(
    coords: Coords,
    advantageForm: AdvantageForm[],
    pointOfSaleType: PointOfSaleType[],
    cursorDir: CursorDirection,
    radius?: number,
  ) {
    return async (distance: any) => {
      const result = this.findManyForImpact(
        'merchant_location',
        coords,
        advantageForm,
        pointOfSaleType,
      ).where({
        distance:
          cursorDir === CursorDirection.BEFORE
            ? LessThan(Number(distance))
            : MoreThan(Number(distance)),
      })
      if (radius) {
        result.andWhere({
          distance: LessThanOrEqual(radius),
        })
      }
      return !!(await result.limit(1).getRawOne())
    }
  }

  private async findOneForImpact(id: string | UUID) {
    const merchant = await this.addLeftJoinForImpact(
      this.repository
        .createQueryBuilder()
        .select(this.findManyForImpactSelect('merchant'))
        .from('merchant', 'merchant')
        .where({ id: id instanceof UUID ? id.value : id }),
    )
      .limit(1)
      .getRawOne()
    merchant.id = new UUID(merchant.id)
    merchant.createdAt = new DateVO(merchant.createdAt)
    merchant.updatedAt = new DateVO(merchant.updatedAt)
    return new PointOfSaleResponse(merchant)
  }

  private findManyForImpact(
    tableName: string,
    coords: Coords,
    advantageForm: AdvantageForm[],
    pointOfSaleType: PointOfSaleType[],
  ): SelectQueryBuilder<any> {
    const query = this.repository.manager
      .createQueryBuilder()
      .select(`${tableName}.distance`)
      .addSelect(this.findManyForImpactSelect('merchant'))
      .from((sub: SelectQueryBuilder<any>) => {
        return this.distanceSubquery(
          sub,
          coords,
          tableName,
          advantageForm,
          pointOfSaleType,
        )
      }, tableName)
      .leftJoin('merchant', 'merchant', `"merchant"."id" = ${tableName}."id"`)
      .andWhere('"merchant_organization"."unactivatedAt" IS NULL')

    return this.addLeftJoinForImpact(query)
  }

  private addLeftJoinForImpact(sub: SelectQueryBuilder<any>) {
    return sub
      .leftJoin(
        'merchant_merchant_organization',
        'merchant_merchant_organization',
        `"merchant_merchant_organization"."mid" = merchant."mid"`,
      )
      .leftJoin(
        'merchant_organization',
        'merchant_organization',
        `"merchant_organization"."siret" = "merchant_merchant_organization"."siret"`,
      )
      .leftJoin(
        'merchant_category',
        'merchant_category',
        `"merchant_category"."id" = merchant."merchantCategoryId"`,
      )
      .leftJoin(
        'merchant_label',
        'merchant_label',
        `"merchant_label"."name" = merchant."labelName"`,
      )
      .leftJoin(
        'merchant_merchant_filter',
        'merchant_merchant_filter',
        `"merchant_merchant_filter"."mid" = merchant."mid"`,
      )
      .leftJoin(
        'merchant_filter',
        'merchant_filter',
        `"merchant_filter"."code" = merchant_merchant_filter."code"`,
      )
  }

  private distanceSubquery(
    sub: SelectQueryBuilder<any>,
    coords: Coords,
    tableName: string,
    advantageForm: AdvantageForm[],
    pointOfSaleType: PointOfSaleType[],
  ) {
    sub
      .select([
        `MIN(CASE WHEN (merchant_location."pointOfSaleType" = 'DELIVERY' AND ${tableName}."deliveryCities" = E'{*}') THEN ${deliveryMinimumDistance} 
          ELSE COALESCE(ROUND(CAST(2 * 6378.137 * asin(
            sqrt(
              (sin(radians((${coords.latitude} - 
                CASE WHEN ${tableName}.latitude IS NOT NULL THEN ${tableName}.latitude ELSE city.latitude END
              ) / 2))) ^ 2 
              + cos(radians(
                CASE WHEN ${tableName}.latitude IS NOT NULL THEN ${tableName}.latitude ELSE city.latitude END
              )) 
              * cos(radians(${coords.latitude})) 
              * (sin(radians((${coords.longitude} - 
                CASE WHEN ${tableName}.longitude IS NOT NULL THEN ${tableName}.longitude ELSE city.longitude END
              ) / 2))) ^ 2
            )
          ) AS numeric), 2), ${unknownLocationDefaultDistance}) END) As distance`,
        'merchant_location.id',
      ])
      .from((sub: SelectQueryBuilder<any>) => {
        const unionQueries: SelectQueryBuilder<any>[] = []
        //merchant with deliveryCities
        unionQueries.push(
          this.repository.manager
            .createQueryBuilder()
            .select(['LOWER(unnest("deliveryCities")) as "c"', 'merchant.*'])
            .from('merchant', 'merchant'),
        )
        //merchant without deliveryCities
        unionQueries.push(
          this.repository.manager
            .createQueryBuilder()
            .select(['NULL as "c"', 'merchant.*'])
            .from('merchant', 'merchant')
            .where({ deliveryCities: IsNull() }),
        )
        return union(sub, ...unionQueries)
      }, tableName)
      .leftJoin('city', 'city', `${tableName}."c" = "city"."name"`)
      .andWhere('"isHidden" IS FALSE')
      .andWhere('"advantageForm" = ANY(:advantageForm)', {
        advantageForm,
      })
      .groupBy(`${tableName}."id"`)
    if (pointOfSaleType?.length > 0) {
      sub.andWhere(`"pointOfSaleType" = ANY(:pointOfSaleType)`, {
        pointOfSaleType,
      })
    }
    return sub
  }

  private findManyForImpactFields(tableName: string): string[][] {
    return [
      [`${tableName}.id`, 'id'],
      [`${tableName}."createdAt"`, 'createdAt'],
      [`${tableName}."updatedAt"`, 'updatedAt'],
      [`${tableName}.name`, 'name'],
      [`merchant_category.mcc`, 'mcc'],
      [`${tableName}."attribute"`, 'attribute'],
      [`${tableName}."advantageForm"`, 'advantageForm'],
      [`${tableName}."pointOfSaleType"`, 'pointOfSaleType'],
      [`${tableName}."reviewLink"`, 'reviewLink'],
      [
        `COALESCE(${tableName}.description, merchant_organization.description)`,
        'description',
      ],
      [`${tableName}.phone`, 'phone'],
      [
        `COALESCE(${tableName}.city,        merchant_organization.city)`,
        'city',
      ],
      [
        `COALESCE(${tableName}."postalCode", merchant_organization."postalCode")`,
        'postalCode',
      ],
      [
        `COALESCE(${tableName}.street,      merchant_organization.street)`,
        'street',
      ],
      [`${tableName}.email`, 'email'],
      [
        `COALESCE(${tableName}.website,     merchant_organization.website)`,
        'website',
      ],
      [
        `CASE WHEN array_length(${tableName}."imageLinks", 1) > 0 THEN ${tableName}."imageLinks" ELSE
          CASE WHEN array_length(merchant_organization."imageLinks", 1) > 0 THEN merchant_organization."imageLinks" ELSE
          merchant_category."defaultImageLinks" END END`,
        'imageLinks',
      ],
      [
        `array_remove(ARRAY[
        CASE WHEN ${tableName}.bio <> 0 THEN '${PointOfSaleGradesType.BIO}' ELSE '' END,
        CASE WHEN ${tableName}.local <> 0 THEN '${PointOfSaleGradesType.LOCAL}' ELSE '' END,
        CASE WHEN ${tableName}.vegetarian <> 0 THEN '${PointOfSaleGradesType.VEGETARIAN}' ELSE '' END,
        CASE WHEN ${tableName}.antiwaste <> 0 THEN '${PointOfSaleGradesType.ANTIWASTE}' ELSE '' END,
        CASE WHEN ${tableName}.nowaste <> 0 THEN '${PointOfSaleGradesType.NOWASTE}' ELSE '' END,
        CASE WHEN ${tableName}.inclusive <> 0 THEN '${PointOfSaleGradesType.INCLUSIVE}' ELSE '' END
      ], '')`,
        'tags',
      ],
      [`merchant_label.name`, 'labelName'],
      [`merchant_label.link`, 'labelLink'],
      [`${tableName}.latitude`, 'latitude'],
      [`${tableName}.longitude`, 'longitude'],
      [`COALESCE(merchant_filter.code, 'NONE')`, 'filterCode'],
      [`COALESCE(merchant_filter.name, 'Autres')`, 'filterName'],
    ]
  }

  private findManyForImpactSelect(tableName: string) {
    return this.findManyForImpactFields(tableName).map(
      ([field, alias]) => `${field} "${alias}"`,
    )
  }

  async findManyByIsCashbackableSince(
    isCashbackableSince: Date,
  ): Promise<MerchantEntity[]> {
    const result = await this.merchantRepository.find({
      where: {
        isCashbackableSince: MoreThan(isCashbackableSince),
        mid: Not(IsNull()),
      },
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async updateManyWithoutMcc(): Promise<void> {
    await this.repository.manager.query(`UPDATE "merchant"
      SET "merchantCategoryId" = (
        SELECT "id"
        FROM "merchant_category"
        WHERE (
          "merchant_category"."mcc" = (
            SELECT "mcc"
            FROM "merchant_category_naf"
            WHERE "naf" = (
              SELECT "naf"
              FROM "merchant_organization"
              INNER JOIN "merchant_merchant_organization"
              ON "merchant_organization"."siret" = "merchant_merchant_organization"."siret"
              WHERE "merchant_merchant_organization"."mid" = "merchant"."mid"
          )
          LIMIT 1
        )
      )
    )
    WHERE "merchantCategoryId" IS NULL AND (
      SELECT COUNT(id) FROM merchant_merchant_organization WHERE mid = merchant.mid
    ) < 2;`)
    return
  }

  async getPaymentSolutions(): Promise<string[]> {
    return this.repository.manager.query(`SELECT name
      FROM payment_solution;`)
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<MerchantProps>,
  ): FindOptionsOrder<MerchantOrmEntity> {
    const order: FindOptionsOrder<MerchantOrmEntity> = {}
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
    params: QueryParams<MerchantProps>,
  ): WhereCondition<MerchantOrmEntity> {
    const where: WhereCondition<MerchantOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.mid) {
      where.mid = params.mid
    }
    if (params.name) {
      where.name = params.name
    }
    if (params.merchantCategory?.id) {
      where.merchantCategoryId = params.merchantCategory.id.value
    }
    return where
  }
}
