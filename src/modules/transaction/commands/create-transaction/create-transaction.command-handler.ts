import { CommandHandler } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { CacheTimes } from '../../../../helpers/cache.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardEntity } from '../../../card/domain/entities/card.entity'
import { MatchMerchantOrganizationCommand } from '../../../merchant/commands/match-merchant-organization/match-merchant-organization.command'
import { matchMerchantOrganization } from '../../../merchant/commands/match-merchant-organization/match-merchant-organization.service'
import { MerchantMerchantOrganizationRepositoryPort } from '../../../merchant/database/merchant-merchant-organization/merchant-merchant-organization.repository.port'
import { MerchantOrganizationRepositoryPort } from '../../../merchant/database/merchant-organization/merchant-organization.repository.port'
import { MerchantRepositoryPort } from '../../../merchant/database/merchant/merchant.repository.port'
import { AdvantageEntity } from '../../../merchant/domain/entities/advantage.entity'
import {
  AdvantageType,
  getAdvantageIndex,
} from '../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryEntity } from '../../../merchant/domain/entities/merchant-category.entity'
import { MerchantMerchantOrganizationEntity } from '../../../merchant/domain/entities/merchant-merchant-organization.entity'
import { MerchantEntity } from '../../../merchant/domain/entities/merchant.entity'
import { AdvantageForm } from '../../../merchant/domain/entities/merchant.types'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { ExternalValidationEntity } from '../../../wallet/domain/entities/external-validation.entity'
import { WalletEntity } from '../../../wallet/domain/entities/wallet.entity'
import { TransactionEntity } from '../../domain/entities/transaction.entity'
import {
  PANEntryMethod,
  TransactionStatus,
} from '../../domain/entities/transaction.types'
import { BaasAuthorizationResponseCode } from '../../domain/value-objects/baas-authorization-response-code.value-object'
import { TransactionAdvantageRepartition } from '../../domain/value-objects/transaction-advantage-repartition.value-object'
import { TransactionAlreadyExistsError } from '../../errors/transaction.errors'
import { DistributeCashbackCommand } from '../distribute-cashback/distribute-cashback.command'
import { distributeCashback } from '../distribute-cashback/distribute-cashback.service'
import { CreateTransactionCommand } from './create-transaction.command'

@CommandHandler(CreateTransactionCommand)
export class CreateTransactionCommandHandler extends CommandHandlerBase {
  private command?: CreateTransactionCommand
  private merchantRepo?: MerchantRepositoryPort
  private merchantMerchantOrganizationRepo?: MerchantMerchantOrganizationRepositoryPort
  private merchantOrganizationRepo?: MerchantOrganizationRepositoryPort

  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  /**
   * Handle the creation of a transaction
   *
   * @param command
   * @returns the id of the transaction or an error
   */
  async handle(
    command: CreateTransactionCommand,
  ): Promise<Result<UUID, TransactionAlreadyExistsError>> {
    let cashbackAmount: number = 0
    let cashbackId: UUID | undefined
    this.command = command
    const transactionRepo = this.unitOfWork.getTransactionRepository(
      command.correlationId,
    )
    this.merchantRepo = this.unitOfWork.getMerchantRepository(
      command.correlationId,
    )
    const walletRepo = this.unitOfWork.getWalletRepository(
      command.correlationId,
    )
    this.merchantMerchantOrganizationRepo =
      this.unitOfWork.getMerchantMerchantOrganizationRepository(
        command.correlationId,
      )
    this.merchantOrganizationRepo =
      this.unitOfWork.getMerchantOrganizationRepository(command.correlationId)
    const merchantCategoryRepo = this.unitOfWork.getMerchantCategoryRepository(
      command.correlationId,
    )

    // Transaction uniqueness guard
    if (await transactionRepo.exists(command.externalTransactionId)) {
      /** Returning an Error instead of throwing it
       *  so a controller can handle it explicitly */
      return Result.err(new TransactionAlreadyExistsError())
    }

    const [
      card,
      merchants,
      existingMcc,
      existingPayment,
      externalValidation,
      advantages,
    ] = await Promise.all([
      this.unitOfWork
        .getCardRepository(command.correlationId)
        .findOneByExternalIdOrThrow(command.externalCardId),
      this.merchantRepo.findManyByMid(command.mid),
      merchantCategoryRepo.findOneByMcc(command.mcc),
      transactionRepo.findOneByExternalPaymentId(command.externalPaymentId),
      this.unitOfWork
        .getExternalValidationRepository(command.correlationId)
        .findOneByAuthorizationIssuerId(command.authorizationIssuerId),
      this.unitOfWork.getAdvantageRepository(command.correlationId).findMany(),
    ])
    const [wallets, cardAcquisitionPayin] = await Promise.all([
      walletRepo.findManyByEmployeeId(card.employeeId.value),
      this.unitOfWork
        .getCardAcquisitionPayinRepository(command.correlationId)
        .findOneActiveByEmployeeId(card.employeeId.value),
    ])

    // We catch every other error to make sure we save transaction in DB
    try {
      // 1) Upsert MCC
      let mcc =
        existingMcc ||
        (await merchantCategoryRepo.save(
          MerchantCategoryEntity.create({
            mcc: new MCC(command.mcc),
          }),
        ))
      //

      // 2) Try to match merchant
      const associatedMerchants: MerchantEntity[] = []
      try {
        const hasExistingMerchant = merchants.length > 0
        associatedMerchants.push(
          ...(await this.matchMerchant(
            mcc,
            hasExistingMerchant,
            externalValidation?.siret,
            existingPayment?.merchantId,
          )),
        )
        if (!(await this.isPaymentSolution(this.command.merchantName))) {
          associatedMerchants.push(...merchants)
        }
      } catch (e) {
        logger.error(
          `[${this.constructor.name}] Error while matching merchant: ${e}`,
        )
      }
      //

      // 3) Handle cashback if needed
      const isCashback =
        associatedMerchants.find(
          (merchant) => merchant.advantageForm === AdvantageForm.CASHBACK,
        ) || this.isMerchantCashbackWhitelist(command.merchantName)
      if (
        (isCashback && command.amount < 0) ||
        command.status === TransactionStatus.Settled
      ) {
        const wallet = wallets.find(
          (wallet) => wallet.advantage === AdvantageType.NONE,
        )!
        const cashbackCommand = new DistributeCashbackCommand({
          correlationId: command.correlationId,
          walletId: wallet.id,
          cashbackableAmount: command.amount,
          employeeId: card.employeeId.value,
          merchantName: command.merchantName,
          paymentDate: command.paymentDate,
          transactionStatus: command.status,
          cashbackId: existingPayment?.cashbackId,
        })
        const res = await distributeCashback(cashbackCommand, this.unitOfWork)
        if (res.isOk && res.value) {
          cashbackAmount = res.value.amount
          cashbackId = res.value.id
        }
      }
      //
    } catch (e) {
      logger.error(
        `[${this.constructor.name}] Error while creating transaction: ${e}`,
      )
    }

    // 4) Create transaction
    const transaction = await this.createTransaction(
      card,
      wallets,
      advantages,
      externalValidation,
      existingPayment,
      cashbackAmount,
      cashbackId,
      cardAcquisitionPayin?.amount,
    )
    //

    try {
      // 5) Transaction may activate physical card if needed
      if (
        !card.isActivated &&
        card.isConvertedToPhysical &&
        command.panEntryMethod === PANEntryMethod.CHIP_CONTACT_INTERFACE
      ) {
        transaction.activatePhysicalCard()
      }
      //
    } catch (e) {
      logger.error(
        `[${this.constructor.name}] Error while creating transaction: ${e}`,
      )
    }

    // 6) Save transaction
    try {
      const created = await transactionRepo.save(transaction)
      return Result.ok(created.id)
    } catch (e) {
      logger.error(
        `[${this.constructor.name}] Error while saving transaction: ${e}`,
      )
      return Result.err(new TransactionAlreadyExistsError())
    }
  }

  /**
   * Create the new transaction but does not save it in repository
   *
   *
   * @param card
   * @param wallets
   * @param advantages
   * @param externalValidation
   * @param existingPayment
   * @param externalWalletOverdraft
   * @returns the new transaction
   */
  private async createTransaction(
    card: CardEntity,
    wallets: WalletEntity[],
    advantages: AdvantageEntity[],
    externalValidation: ExternalValidationEntity | undefined,
    existingPayment: TransactionEntity | undefined,
    cashbackAmount: number,
    cashbackId?: UUID,
    externalWalletOverdraft: number = 0,
  ): Promise<TransactionEntity> {
    if (!this.command) {
      throw new Error('Command not set')
    }

    const declinedReason = externalValidation
      ? externalValidation.declinedReason ??
        this.command.declinedReason ??
        undefined
      : this.command.declinedReason ?? undefined
    // Same advantageRepartition for an entire payment, except for partial transaction
    // For partial transaction we take the balance from the existing payment repartition
    const walletBalances =
      existingPayment &&
      !existingPayment.authorizationNote?.includes(
        'Gen: Pre-Authorization Request',
      )
        ? Object.entries(existingPayment.advantageRepartition).map(
            ([advantage, balance]) => {
              return {
                advantage: advantage as AdvantageType,
                amount: Math.abs(balance),
                // Limit unused cause we will take existing repartition
                limit: undefined,
              }
            },
          )
        : wallets.map((wallet) => {
            if (wallet.advantage === AdvantageType.EXTERNAL) {
              return {
                advantage: wallet.advantage,
                amount: externalWalletOverdraft,
                limit: externalWalletOverdraft,
              }
            }
            return {
              advantage: wallet.advantage,
              amount:
                this.command?.status === TransactionStatus.Settled
                  ? Math.max(wallet.balance, 0)
                  : Math.max(wallet.authorizedBalance, 0),
              limit: advantages.find(
                (advantage) => advantage.type === wallet.advantage,
              )?.legalLimit!,
            }
          })

    const advantageRepartition =
      existingPayment && existingPayment.amount === this.command.amount
        ? new TransactionAdvantageRepartition(
            existingPayment.advantageRepartition,
          )
        : TransactionEntity.allocateTransactionToAdvantage(
            this.command.amount,
            walletBalances.sort(
              (a, b) =>
                getAdvantageIndex(a.advantage) - getAdvantageIndex(b.advantage),
            ),
          )
    return TransactionEntity.create(
      {
        cardId: card.id,
        employeeId: card.employeeId,
        merchantId:
          this.command.mid !== ''
            ? this.command.mid
            : existingPayment?.merchantId ?? 'UNKNOWN',
        merchantName: this.command.merchantName,
        mcc: new MCC(this.command.mcc),
        cardPublicToken: card.publicToken,
        externalTransactionId: this.command.externalTransactionId,
        externalPaymentId: this.command.externalPaymentId,
        // We need to do that cause sometimes settled transactions are off on the paymentDate
        paymentDate: existingPayment
          ? existingPayment.paymentDate
          : new DateVO(this.command.paymentDate),
        amount: this.command.amount,
        status: this.command.status,
        authorizationNote: this.command.authorizationNote,
        authorizationResponseCode: new BaasAuthorizationResponseCode(
          this.command.authorizationResponseCode,
        ),
        declinedReason: declinedReason,
        advantageRepartition: advantageRepartition,
        authorizationIssuerId: this.command.authorizationIssuerId,
        authorizationMti: this.command.authorizationMti,
        cashbackId: cashbackId,
      },
      existingPayment?.authorizationNote?.includes(
        'Gen: Pre-Authorization Request',
      )
        ? existingPayment.amount
        : undefined,
      cashbackAmount,
    )
  }

  private async isPaymentSolution(merchantName: string): Promise<boolean> {
    const paymentsSolutionsName: string[] = await this.redis.fetch(
      `paymentsSolutionsName`,
      CacheTimes.OneDay,
      async () => {
        return await this.merchantRepo!.getPaymentSolutions()
      },
    )
    return paymentsSolutionsName.some((name) =>
      merchantName.toLowerCase().includes(name),
    )
  }

  /**
   * Try to match the merchant through various methods
   *
   * @param mcc
   * @param hasExistingMerchant
   * @param externalValidationSiret
   * @param existingPaymentMid
   * @returns the list of merchants matching with the one of the command
   */
  private async matchMerchant(
    mcc: MerchantCategoryEntity,
    hasExistingMerchant: boolean,
    externalValidationSiret?: string,
    existingPaymentMid?: string,
  ): Promise<MerchantEntity[]> {
    if (!this.command) {
      throw new Error('Command not set')
    }
    if (!this.merchantMerchantOrganizationRepo) {
      throw new Error('Merchant repository not set')
    }
    if (!this.merchantOrganizationRepo) {
      throw new Error('Merchant organization repository not set')
    }

    const associatedMerchants: MerchantEntity[] = []

    let existingMmo: MerchantMerchantOrganizationEntity | undefined = undefined

    // For payments solutions where mid can be use with multiples merchant
    // we need to be more strict and add an additional check on the merchant name
    if (await this.isPaymentSolution(this.command.merchantName)) {
      existingMmo = hasExistingMerchant
        ? await this.merchantMerchantOrganizationRepo.findOneByMidAndMerchantName(
            this.command.mid,
            this.command.merchantName,
          )
        : undefined
    } else {
      // find mmo with this mid
      existingMmo = hasExistingMerchant
        ? await this.merchantMerchantOrganizationRepo.findOneByMid(
            this.command.mid,
          )
        : undefined
    }

    // If already matched we return it
    if (existingMmo) {
      return associatedMerchants
    }

    let siret: string | undefined
    // If there is an previous transaction in the same payment with a different mid
    // We match it to the same siret
    const existingMatch = existingPaymentMid
      ? await this.merchantMerchantOrganizationRepo.findOneByMid(
          existingPaymentMid,
        )
      : undefined

    // There could be cases where the merchant is already matched
    // in mmo but with a different mid so we use the merchant name
    const existingMatchByNameMmo =
      await this.merchantMerchantOrganizationRepo.findAllByMerchantName(
        this.command.merchantName,
      )

    if (existingMatch) {
      siret = existingMatch.siret
    }
    // Because the merchant name is not unique, we also look at the city
    else if (existingMatchByNameMmo.length > 0) {
      for (const match of existingMatchByNameMmo) {
        siret = match.siret
        const merchantOrganization =
          await this.merchantOrganizationRepo.findOneBySiret(siret)

        if (merchantOrganization) {
          if (
            merchantOrganization.address.city.toLowerCase() ===
            this.command.merchantCity.toLowerCase()
          ) {
            break
          }
        }

        // If the city does not match we reset the siret
        siret = undefined
      }
    }
    // If the mid is formatted as * + 14 caracters (length of a siret)
    // We guess that it must be *siret and we match it like that
    else if (
      this.command.mid.length === 15 &&
      this.command.mid.startsWith('*')
    ) {
      siret = this.command.mid.slice(1)
    }
    // If not we try to match it by name
    else {
      const matchedSiret = externalValidationSiret
        ? externalValidationSiret
        : await this.findSiretByNameMatch()
      if (matchedSiret) {
        siret = matchedSiret
      }
    }

    const tempMerchant = []
    // We save the matched siret if we found one
    if (siret) {
      const foundMerchant = await this.upsertMmo(
        this.command.mid,
        siret,
        this.command.merchantName,
        mcc,
      )

      const tempMerchants = foundMerchant ? [foundMerchant] : []

      tempMerchant.push(...tempMerchants)
      if (tempMerchant.length > 0) {
        associatedMerchants.push(...tempMerchant)
      }
    }

    if (!hasExistingMerchant && tempMerchant.length === 0) {
      // create merchant if it does not exist
      const newMerchant = await this.createMerchant(mcc)
      associatedMerchants.push(newMerchant)
    }
    return associatedMerchants
  }

  /**
   * We save the merchant if we have a match, update its mid if needed
   *
   * @param mid
   * @param matchedSiret
   * @param merchantName
   * @param mcc
   * @returns the found merchant or an empty array
   */
  private async upsertMmo(
    mid: string,
    matchedSiret: string,
    merchantName: string,
    mcc: MerchantCategoryEntity,
  ): Promise<MerchantEntity | undefined> {
    if (!this.merchantMerchantOrganizationRepo) {
      throw new Error('Merchant repository not set')
    }
    if (!this.merchantRepo) {
      throw new Error('Merchant repository not set')
    }

    const existingMmo =
      await this.merchantMerchantOrganizationRepo.findOneBySiret(matchedSiret)
    if (existingMmo?.mid?.includes('EKIPTEMPORARY*')) {
      const tempMerchant = await this.merchantRepo.findOneByMid(existingMmo.mid)
      if (
        !(await this.merchantMerchantOrganizationRepo.exists(
          mid,
          existingMmo.siret,
          existingMmo.merchantName,
        ))
      ) {
        await this.merchantMerchantOrganizationRepo.updateMid(
          existingMmo.mid,
          mid,
        )
      }
      if (tempMerchant) {
        tempMerchant.mid = mid
        await this.merchantRepo.save(tempMerchant)
        return tempMerchant
      }
    } else {
      // create mmo
      await this.createMerchant(mcc)
      await this.merchantMerchantOrganizationRepo.upsert(
        mid,
        merchantName,
        matchedSiret,
      )

      // If we find a merchant with the same siret (but not temporary) we return it
      if (existingMmo) {
        const merchant = await this.merchantRepo.findOneByMid(existingMmo.mid)
        return merchant
      }
    }
    // No tempMerchantFound
    return undefined
  }

  /**
   * Match the merchant to merchant organization based on its name and city
   *
   * @returns the siret of the matched merchant or undefined
   */
  private async findSiretByNameMatch(): Promise<string | undefined> {
    if (!this.command) {
      throw new Error('Command not set')
    }

    const matchedMerchant = await matchMerchantOrganization(
      new MatchMerchantOrganizationCommand({
        merchantCity: this.command.merchantCity,
        merchantName: this.command.merchantName,
        correlationId: this.command.correlationId,
      }),
      this.unitOfWork.getMerchantOrganizationRepository(
        this.command.correlationId,
      ),
    )
    return matchedMerchant.length === 1 ? matchedMerchant[0].siret : undefined
  }

  /**
   * Save the new merchant
   *
   * @param mcc
   * @returns the saved merchant entity
   */
  private async createMerchant(mcc: MerchantCategoryEntity) {
    if (!this.merchantRepo) {
      throw new Error('Merchant repository not set')
    }
    if (!this.command) {
      throw new Error('Command not set')
    }

    return this.merchantRepo.save(
      MerchantEntity.create({
        name: this.command.merchantName,
        mid: this.command.mid.trim(),
        merchantCategory: mcc,
        address: new Address({
          city: this.command.merchantCity,
          street: this.command.merchantAddress,
          country: this.command.merchantCountry,
        }),
      }),
    )
  }

  private isMerchantCashbackWhitelist(merchantName: string): boolean {
    const merchantWhitelist: string[] = [
      'SumUp*LaFermedeCe',
      'SumUp*GAECDELARCHE',
    ]
    return merchantWhitelist.some((name) => merchantName.includes(name))
  }
}
