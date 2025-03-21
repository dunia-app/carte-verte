import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, In, Repository, SelectQueryBuilder } from 'typeorm'
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
  WalletEntity,
  WalletProps,
} from '../../../../modules/wallet/domain/entities/wallet.entity'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { WalletOrmEntity } from './wallet.orm-entity'
import { WalletOrmMapper } from './wallet.orm-mapper'
import {
  WalletRepositoryPort,
  WalletWithExpiredMealTicket,
} from './wallet.repository.port'

@Injectable()
export class WalletRepository
  extends TypeormRepositoryBase<WalletEntity, WalletProps, WalletOrmEntity>
  implements WalletRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(WalletOrmEntity)
    private readonly walletRepository: Repository<WalletOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      walletRepository,
      new WalletOrmMapper(WalletEntity, WalletOrmEntity, config),
      logger,
    )
  }

  private async findOneByEmployeeIdAndAdvantageOrm(
    employeeId: string,
    advantage: AdvantageType,
  ): Promise<WalletOrmEntity | null> {
    const wallet = await this.walletRepository.findOne({
      where: { employeeId, advantage },
    })

    return wallet
  }

  async findOneByEmployeeIdAndAdvantage(
    employeeId: string,
    advantage: AdvantageType,
  ): Promise<WalletEntity | undefined> {
    const wallet = await this.findOneByEmployeeIdAndAdvantageOrm(
      employeeId,
      advantage,
    )

    return wallet ? this.mapper.toDomainEntity(wallet) : undefined
  }

  async findOneByEmployeeIdAndAdvantageOrThrow(
    employeeId: string,
    advantage: AdvantageType,
  ): Promise<WalletEntity> {
    const wallet = await this.findOneByEmployeeIdAndAdvantageOrm(
      employeeId,
      advantage,
    )
    if (!wallet) {
      throw new NotFoundException(
        `Wallet with employeeId '${employeeId}' not found for this advantage`,
      )
    }
    return this.mapper.toDomainEntity(wallet)
  }

  async findManyByEmployeeId(employeeId: string): Promise<WalletEntity[]> {
    const result = await this.walletRepository.find({
      where: { employeeId: employeeId },
      relations: this.relations,
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByEmployeeIds(employeeIds: string[]): Promise<WalletEntity[]> {
    const result = await this.walletRepository.find({
      where: { employeeId: In(employeeIds) },
      relations: this.relations,
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async findManyByEmployeeIdAdvantage(
    employeeIds: string[],
    advantage: AdvantageType,
  ): Promise<WalletEntity[]> {
    const result = await this.walletRepository.find({
      where: { employeeId: In(employeeIds), advantage: advantage },
      relations: this.relations,
    })

    return result.map((item) => this.mapper.toDomainEntity(item))
  }

  async countWithExpiredMealTicket(): Promise<number> {
    const res = await this.repository.manager
      .createQueryBuilder()
      .select(['COUNT(DISTINCT("wallet"."walletId")) AS "cnt"'])
      .from(
        (sub: SelectQueryBuilder<any>) =>
          this.getWalletWithExpiredMealTicketQuery(sub),
        'wallet',
      )
      .limit(1)
      .getRawOne()
    return res.cnt
  }

  async findManyWithExpiredMealTicket(
    batch: number = 5000,
  ): Promise<WalletWithExpiredMealTicket[]> {
    const expiredMealTickets = await this.getWalletWithExpiredMealTicketQuery(
      this.repository.manager.createQueryBuilder(),
    )
      .take(batch)
      .getRawMany()
    const wallets: WalletWithExpiredMealTicket[] = []
    const walletToSkip: string[] = []
    // Group mealTicket by wallets
    expiredMealTickets.forEach((ticket) => {
      let existingWallet = wallets.find(
        (wallet) => wallet.walletId === ticket.wallet,
      )
      if (!existingWallet) {
        existingWallet = {
          employeeId: ticket.employeeId,
          walletId: ticket.walletId,
          mealTicketExpiredAmount: ticket.mealTicketExpiredAmount,
        }
        wallets.push(existingWallet)
      } else if (
        existingWallet.mealTicketExpiredAmount !==
        ticket.mealTicketExpiredAmount
      ) {
        walletToSkip.push(existingWallet.walletId)
      }
    })
    // Remove conflict wallets and alert so that we investigate by hand
    if (walletToSkip.length) {
      this.logger.error(
        `${
          this.constructor.name
        }:findManyWithExpiredMealTicket: difference between mealTicketTotalAmount for wallets : ${walletToSkip.toString()}, please investigate`,
      )
      return wallets.filter((wallet) => !walletToSkip.includes(wallet.walletId))
    }
    return wallets
  }

  async exists(employeeId: string, advantage: AdvantageType): Promise<boolean> {
    const found = await this.findOneByEmployeeIdAndAdvantage(
      employeeId,
      advantage,
    )
    if (found) {
      return true
    }
    return false
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<WalletProps>,
  ): FindOptionsOrder<WalletOrmEntity> {
    const order: FindOptionsOrder<WalletOrmEntity> = {}
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
    params: QueryParams<WalletProps>,
  ): WhereCondition<WalletOrmEntity> {
    const where: WhereCondition<WalletOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.employeeId) {
      where.employeeId = params.employeeId.value
    }
    if (params.advantage) {
      where.advantage = params.advantage
    }
    return where
  }

  private getWalletWithExpiredMealTicketQuery(
    sub: SelectQueryBuilder<any>,
  ): SelectQueryBuilder<any> {
    return sub
      .select([
        `wallet.id "walletId"`,
        `wallet."employeeId"`,
        `wallet."authorizedBalance" - COALESCE(command."maxNonExpiredAmount", 0) "mealTicketExpiredAmount"`,
      ])
      .from('wallet', 'wallet')
      .leftJoin(
        (sub: SelectQueryBuilder<any>) => {
          return (
            sub
              .select([
                `(element ->> 'employeeId')::uuid "employeeId"`,
                `SUM(command."mealTicketAmount" * (element ->> 'mealTicketCount')::integer) "maxNonExpiredAmount"`,
              ])
              .from('meal_ticket_command', 'command')
              .leftJoin(
                'organization',
                'organization',
                'command."organizationId" = organization.id',
              )
              // As typeorm does not support CROSS JOIN LATERAL we need to do it like that
              .leftJoin(
                '(SELECT 1)',
                'dummy',
                `TRUE CROSS JOIN LATERAL jsonb_array_elements("command"."mealTicketCountPerEmployee") element`,
              )
              .where(`command."organizationId" IS NOT NULL`)
              .andWhere(
                `command."distributedAt" > (to_date( to_char(CURRENT_DATE ,'yyyy') || '-01-01','yyyy-mm-dd')  - (CASE WHEN organization."mealTicketAutoRenew" THEN INTERVAL '1 years' ELSE INTERVAL '0 years' END))`,
              )
              .groupBy(`(element ->> 'employeeId')::text`)
          )
        },
        'command',
        'command."employeeId" = wallet."employeeId"',
      )
      .where(`wallet.advantage = '${AdvantageType.MEALTICKET}'`)
      .andWhere(`"wallet"."authorizedBalance" > 0`)
      .andWhere(
        `wallet."authorizedBalance" - COALESCE(command."maxNonExpiredAmount", 0) > 0`,
      )
  }
}
