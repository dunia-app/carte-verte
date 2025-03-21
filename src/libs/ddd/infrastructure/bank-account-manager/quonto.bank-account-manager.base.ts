import { Result } from '@badrap/result'
import {
  NotImplementedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { firstValueFrom, from as rxjsFrom } from 'rxjs'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { TransferDirection } from '../../../../modules/transaction/domain/entities/transfer.types'
import { ExceptionBase } from '../../../exceptions/index'
import { TWithStringKeys } from '../../../types/t-with-keys'
import {
  BankAccountManagerPort,
  BankAccountManagerTransfer,
  BankAccountName,
} from '../../domain/ports/bank-account-manager.port'
import { Logger } from '../../domain/ports/logger.port'
import {
  QuontoTransaction,
  QuontoTransactionResponse,
} from './quonto.bank-account-manager.entity'

export class QuontoBankAccountManager implements BankAccountManagerPort {
  private retryConfig = {
    retry: 3,
    retryDelay: 3000,
  } as AxiosRequestConfig<any>
  private axiosInstance! : AxiosInstance
  private readonly config: ConfigService
  private readonly logger: Logger
  constructor() {
    this.config = new ConfigService()
    this.logger = logger
    this.getClient()
  }

  private getClient() {
    const login = this.config.getStr('QUONTO_LOGIN')
    const secret = this.config.getStr('QUONTO_SECRET')
    const headers: TWithStringKeys = {
      Authorization: `${login}:${secret}`,
    }
    this.axiosInstance = axios.create({
      baseURL: this.config.getStr('QUONTO_URL'),
      timeout: 10000,
      headers,
    })
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const data = error?.response?.data
        let { config, message } = error
        const msg = data ? JSON.stringify(data, null, 2) : message
        // retry while Network timeout or Network Error
        if (
          !config ||
          !config.retry ||
          !(message.includes('timeout') || message.includes('Network Error'))
        ) {
          this.logger.error(
            msg,
            null,
            `[${this.constructor.name}]: Quonto Api Error for path ${error.request.path}`,
          )
          throw new UnprocessableEntityException(`Quonto Error: ${msg}`)
        }
        config.retry -= 1
        const delayRetryRequest = new Promise<void>((resolve) => {
          setTimeout(() => {
            this.logger.log(
              `[${this.constructor.name}]: retry the request url: ${config.url}`,
            )
            resolve()
          }, config.retryDelay || 1000)
        })
        return delayRetryRequest.then(() => axios(config))
      },
    )
  }

  async getTransfer(
    bankAccountName: BankAccountName,
    direction?: TransferDirection,
    from?: Date,
    to?: Date,
  ): Promise<Result<BankAccountManagerTransfer[], ExceptionBase>> {
    let page: number | undefined = 1
    let transfers = []

    const parameters = `slug=${this.bankAccountNameToSlug(bankAccountName)}${
      direction ? '&side=' + this.transferDirectionToSide(direction) : ''
    }${from ? '&settled_at_from=' + from.toISOString() : ''}${
      to ? '&settled_at_to=' + to.toISOString() : ''
    }`

    while (page) {
      const response: AxiosResponse<QuontoTransactionResponse, any> =
        await firstValueFrom(
          rxjsFrom(this.axiosInstance.get<QuontoTransactionResponse>(
            `transactions?${parameters}&page=${page}`,
            this.retryConfig,
          )),
        )
      if (response.data.transactions[0]) {
        transfers.push(...response.data.transactions)
      }
      page = response.data.meta.next_page
    }

    return Result.ok(
      transfers.map((transfer) =>
        this.transactionToBankAccountManagerTransfer(transfer),
      ),
    )
  }

  private transactionToBankAccountManagerTransfer(
    transfer: QuontoTransaction,
  ): BankAccountManagerTransfer {
    return {
      amount: transfer.amount,
      direction:
        transfer.side === 'debit'
          ? TransferDirection.DEBIT
          : TransferDirection.CREDIT,
      externalId: transfer.transaction_id,
      iban: transfer.income.counterparty_account_number,
      label: transfer.label,
      reference: transfer.reference,
      settledAt: transfer.settled_at,
    }
  }

  private bankAccountNameToSlug(bankAccountName: BankAccountName): string {
    switch (bankAccountName) {
      case BankAccountName.PIVOT_ACCOUNT:
        return `${this.config.getStr('QUONTO_LOGIN')}-bank-account-4`
      default:
        throw new NotImplementedException(
          `QuontoBankAccountManager: Unknown bankAccountName: ${bankAccountName}`,
        )
    }
  }

  private transferDirectionToSide(
    transferDirection: TransferDirection,
  ): string {
    switch (transferDirection) {
      case TransferDirection.DEBIT:
        return 'debit'
      case TransferDirection.CREDIT:
        return 'credit'
      default:
        throw new NotImplementedException(
          `QuontoBankAccountManager: Unknown transferDirection: ${transferDirection}`,
        )
    }
  }
}