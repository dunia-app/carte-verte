import { Result } from '@badrap/result'
import { UnprocessableEntityException } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { firstValueFrom, from } from 'rxjs'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { CardAcquisitionPayinStatus } from '../../../../modules/wallet/domain/entities/card-acquisition-payin.types'
import { TWithStringKeys } from '../../../types/t-with-keys'
import {
  CardAcquisitionLinkResult,
  CardAcquisitionPayinResult,
  CardAcquisitionResult,
  CardAcquisitionServiceError,
  CardAcquisitionServicePort,
  generateExternalCardAcquisitionId,
  getOrderId,
  PayinOperation,
} from '../../domain/ports/card-acquisition-service.port'
import {
  HipayHpayment,
  hipayStatusToCardAcquisitionPayinStatus,
  HipayTransaction,
  HipayTransactionResponse,
  isHipayTransaction,
} from './hipay.entity'

const HIPAY_THEME_CODE = '4rL7UHhgamGvIXNkCmQo'

export class HipayCardAcquisitionService implements CardAcquisitionServicePort {
  private readonly config: ConfigService
  private axiosInstance: AxiosInstance
  private axiosSecureInstance: AxiosInstance
  private axiosSecureVaultClient: AxiosInstance
  private treezorClientId?: string
  private walletId?: string
  constructor() {
    this.config = new ConfigService()
    const hipayUrl = this.config.getStr('HIPAY_URL')
    const hipaySecureUrl = this.config.getStr('HIPAY_SECURE_URL')
    const hipaySecureVaultUrl = this.config.getStr('HIPAY_SECURE_VAULT_URL')
    this.axiosInstance = this.getClient(hipayUrl)
    this.axiosSecureInstance = this.getClient(hipaySecureUrl)
    this.axiosSecureVaultClient = this.getClient(hipaySecureVaultUrl)
  }

  private getClient(url: string) {
    const hipayUsername = this.config.getStr('HIPAY_USERNAME')
    const hipayPassword = this.config.getStr('HIPAY_PASSWORD')
    this.treezorClientId = this.config.getStr('TREEZOR_CLIENT_ID')
    this.walletId = this.config.getStr('TREEZOR_MASTER_WALLET_ID')
    const headers: TWithStringKeys = {
      Authorization: `Basic ${Buffer.from(
        `${hipayUsername}:${hipayPassword}`,
      ).toString('base64')}`,
      Accept: 'application/json',
    }
    const instance = axios.create({
      baseURL: url,
      timeout: 10000,
      headers,
    })
    instance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const data = error?.response?.data
        let { config, message } = error
        const msg = data ? JSON.stringify(data, null, 2) : message
        throw new UnprocessableEntityException(`Hipay Error: ${msg}`)
      },
    )
    return instance
  }

  getExternalCardAcquisitionId(orderId: string): string {
    return orderId.split('_').pop() || ''
  }

  async requestCardAcquisitionLink(
    externalEmployeeId: string,
  ): Promise<Result<CardAcquisitionLinkResult, CardAcquisitionServiceError>> {
    const externalCardAcquisitionId =
      generateExternalCardAcquisitionId(externalEmployeeId)
    const orderId = getOrderId(externalCardAcquisitionId, externalEmployeeId)
    const hpayment = {
      orderid: orderId,
      operation: 'Authorization',
      description: 'Card acquisition',
      currency: 'EUR',
      amount: '0.006',
      eci: '7',
      authentication_indicator: '2',
      multi_use: '1',
      template: 'iframe-js',
      expiration_limit: '3',
      display_cancel_button: '0',
      accept_url: this.config.getStr('HIPAY_ACCEPT_URL'),
      decline_url: this.config.getStr('HIPAY_DECLINE_URL'),
      custom_data: {
        '1': this.treezorClientId,
        '2': this.walletId,
        '3': externalEmployeeId,
      },
      theme_code: HIPAY_THEME_CODE,
      language: 'fr_FR',
    }
    const res = await firstValueFrom(
      from(this.axiosInstance.post<HipayHpayment>('/hpayment', hpayment)),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    if (!res.data.forwardUrl) {
      return Result.err(
        new CardAcquisitionServiceError('No forwardUrl in transaction'),
      )
    }
    return Result.ok({
      url: res.data.forwardUrl,
      orderId: orderId,
    })
  }

  async getCardAcquisition(
    externalCardAcquisitionId: string,
    externalEmployeeId: string,
  ): Promise<Result<CardAcquisitionResult, CardAcquisitionServiceError>> {
    const orderId = getOrderId(externalCardAcquisitionId, externalEmployeeId)
    const res = await firstValueFrom(
      from(
        this.axiosSecureInstance.get<HipayTransactionResponse>(
          `/transaction?orderid=${orderId}`,
        ),
      ),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }

    // Handle both case for hipayTransaction
    const completedTransaction = this.getHipayTransaction(res.data)

    if (!completedTransaction.paymentMethod?.token) {
      logger.error(
        `No token in transaction: ${JSON.stringify(completedTransaction)}`,
      )
      return Result.err(
        new CardAcquisitionServiceError('No token in transaction'),
      )
    }
    const ret = {
      token: completedTransaction.paymentMethod?.token,
      maskedPan: completedTransaction.paymentMethod?.pan,
      reference: completedTransaction.transactionReference,
      paymentProduct: completedTransaction.paymentProduct,
      status: hipayStatusToCardAcquisitionPayinStatus(
        completedTransaction.status,
      ),
    }
    return Result.ok(ret)
  }

  async updateCardAcquisitionAmount(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    transactionReference: string,
    paymentProduct: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    const result = await this.cancelPayin(transactionReference)
    if (result.isErr) {
      return Result.err(result.error)
    }
    return this.authorizePayin(
      externalEmployeeId,
      externalCardToken,
      amount,
      paymentProduct,
    )
  }

  async cancelCardAcquisition(
    externalCardToken: string,
  ): Promise<Result<true, CardAcquisitionServiceError>> {
    const deleteFormData = {
      card_token: externalCardToken,
    }
    const res = await firstValueFrom(
      from(
        this.axiosSecureVaultClient.delete<null>(`/token`, {
          data: deleteFormData,
        }),
      ),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    return Result.ok(true)
  }

  async authorizePayin(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    paymentProduct: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    return this.createPayin(
      externalEmployeeId,
      externalCardToken,
      amount,
      true,
      paymentProduct,
      'Empreinte Carte Verte',
    )
  }

  async directPayin(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    paymentProduct: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    return this.createPayin(
      externalEmployeeId,
      externalCardToken,
      amount,
      false,
      paymentProduct,
      `CARTEVERTE*${description}`,
    )
  }

  private async createPayin(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    isAuthorization: boolean,
    paymentProduct: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    const externalCardAcquisitionId =
      generateExternalCardAcquisitionId(externalEmployeeId)
    const order = {
      orderid: getOrderId(externalCardAcquisitionId, externalEmployeeId),
      operation: isAuthorization ? 'Authorization' : 'Sale',
      description: description,
      currency: 'EUR',
      amount: amount.toString(),
      eci: '9',
      authentication_indicator: '2',
      cardtoken: externalCardToken,
      payment_product: paymentProduct,
      custom_data: {
        '1': this.treezorClientId,
        '2': this.walletId,
        '3': externalEmployeeId,
      },
    }
    logger.log(
      `[updateCardAcquisitionOverdraft]: order: ${JSON.stringify(order)}`,
    )
    const res = await firstValueFrom(
      from(
        this.axiosSecureInstance.post<HipayTransaction>(`/order`, order, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    if (!res.data.transactionReference) {
      return Result.err(
        new CardAcquisitionServiceError('No reference in transaction'),
      )
    }
    return Result.ok({
      reference: res.data.transactionReference,
      externalAuthorizationId: res.data.order.id,
      status: hipayStatusToCardAcquisitionPayinStatus(res.data.status),
    })
  }

  async cancelPayin(
    externalCardTransactionReference: string,
  ): Promise<Result<string, CardAcquisitionServiceError>> {
    return this.updatePayin(
      externalCardTransactionReference,
      PayinOperation.cancel,
    )
  }

  async capturePayin(
    externalCardTransactionReference: string,
    amount: number,
  ): Promise<Result<string, CardAcquisitionServiceError>> {
    return this.updatePayin(
      externalCardTransactionReference,
      PayinOperation.capture,
      amount,
    )
  }

  private async updatePayin(
    externalCardTransactionReference: string,
    operation: PayinOperation,
    amount?: number,
  ): Promise<Result<string, CardAcquisitionServiceError>> {
    const order = {
      operation: operation,
      amount: amount?.toString(),
    }
    const res = await firstValueFrom(
      from(
        this.axiosSecureInstance.post<HipayTransaction>(
          `/maintenance/transaction/${externalCardTransactionReference}`,
          order,
        ),
      ),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    if (!res.data.operation) {
      return Result.err(
        new CardAcquisitionServiceError('No reference in transaction'),
      )
    }
    return Result.ok(res.data.transactionReference)
  }

  async getCardTransactionStatus(
    reference: string,
  ): Promise<Result<CardAcquisitionPayinStatus, CardAcquisitionServiceError>> {
    const res = await firstValueFrom(
      from(
        this.axiosSecureInstance.get<HipayTransactionResponse>(
          `/transaction/${reference}`,
        ),
      ),
    )
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    const transaction = this.getHipayTransaction(res.data)
    return Result.ok(
      hipayStatusToCardAcquisitionPayinStatus(transaction.status),
    )
  }

  private getHipayTransaction(
    data: HipayTransactionResponse,
  ): HipayTransaction {
    if (isHipayTransaction(data.transaction)) {
      return data.transaction
    } else {
      const completed = Object.values(data.transaction).find((t) => {
        return t.state === 'completed'
      })
      return completed ? completed : Object.values(data.transaction)[0]
    }
  }
}
