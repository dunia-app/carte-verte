import {
  Inject,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { firstValueFrom, from as rxjsFrom } from 'rxjs'
import { logger } from '../../../../helpers/application.helper'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'
import {
  LockStatus,
  XPayProvider,
} from '../../../../modules/card/domain/entities/card.types'
import { NotFoundException } from '../../../exceptions/index'
import {
  BaasAddress,
  BaasCardProps,
  BaasPort,
  BaasUserProps,
  CardNotFoundOrNotActiveError,
  CreateBaasCardProps,
  CreateBaasCardResponse,
  CreateBaasUserProps,
  EmulateCardTransactionProps,
  GetCardTransactionsResponse,
  TokenRequestorNeedsCertificatesError,
  UpdateBaasUserProps,
  UserAddressNotAcceptedByBaasError,
  UserEmailAddressAlreadyUsedError,
  UserOrWalletNotFoundOrNotActiveError,
  WrongPinError,
} from '../../domain/ports/baas.port'
import {
  CardAcquisitionPayinResult,
  CardAcquisitionServiceError,
  generateExternalCardAcquisitionIdV2,
  getOrderIdV2,
} from '../../domain/ports/card-acquisition-service.port'
import { Logger } from '../../domain/ports/logger.port'
import { Result } from '../../domain/utils/result.util'
import { Address } from '../../domain/value-objects/address.value-object'
import { HipayTransaction } from '../card-acquisition-service/hipay.entity'
import { AuthenticationResponse } from './dto/oath-token.dto'
import {
  PostSimulationCardTransactionsInput,
  TreezorCardAuthorizationResponse,
  TreezorTopupCardResponse,
  TreezorTransactionsResponse,
  TreezorTransactionsResponseWithCursor,
} from './dto/treezor-card-transactions.dto'
import {
  DeleteCardDigitalizationsInput,
  PostCardsCreateVirtualInput,
  PutCardDigitalizationsInput,
  PutCardLimitsInput,
  PutCardOptionsInput,
  PutCardOptionsInputProps,
  PutChangePinInput,
  PutLockUnlockCardInput,
  PutSetPinInput,
  RequestXPayCredentialInput,
  TreezorCardDigitalizationsResponse,
  TreezorCardImagesResponse,
  TreezorCardsResponse,
  TreezorIssuerInitiatedDigitizationDataResponse,
  TreezorIssuerInitiatedDigitizationDatasResponse,
} from './dto/treezor-cards.dto'
import { CreatePayinInput } from './dto/treezor-payin.dto'
import {
  PostUsersInput,
  PutUsersInput,
  TreezorUsersResponse,
} from './dto/treezor-users.dto'
import {
  TreezorCardAuthorization,
  TreezorCardDigitalization,
  treezorCardPropsToBaasCardProps,
  treezorPayinPropsToBaasPayinProps,
  TreezorPayins,
  treezorTransactionPropsToBaasTransactionProps,
  treezorUserPropsToBaasUserProps,
} from './treezor.entity'
import {
  dateToTreezorDateFormat,
  TreezorCardDigitalizationReasonCodeSuspendPermanently,
  TreezorCardDigitalizationReasonCodeSuspendTemporarly,
  TreezorCardDigitalizationStatus,
  TreezorUserTitle,
  TreezorUserType,
} from './treezor.types'

// Maybe add those in a constant table in DB ?
const cardPermsGroup = 'TRZ-CU-012'
const cardPrintId = '13662'
const designCode = 'V1'
const cardVirtualDefaultPin = '9876'
const duniaAddress = '39 RUE DE GAND'
const duniaPostcode = '59800'
const duniaCity = 'LILLE'
const duniaCountry = 'FR'
const paymentDailyLimit = 400

const apiPrefix = 'v1/'

export class TreezorBaas implements BaasPort {
  private axiosInstance?: AxiosInstance
  private readonly config: ConfigService
  private readonly redis: RedisService
  private readonly logger: Logger
  private readonly masterWalletId: number
  private readonly masterUserId: number

  constructor(
    @Inject(ConfigService) config: ConfigService,
    redis: RedisService,
  ) {
    this.config = config
    this.redis = redis
    this.logger = logger
    this.masterWalletId = this.config.getNb('TREEZOR_MASTER_WALLET_ID')
    this.masterUserId = this.config.getNb('TREEZOR_MASTER_USER_ID')
  }

  async createVirtualCard(
    cardInput: CreateBaasCardProps,
  ): Promise<
    Result<CreateBaasCardResponse, UserOrWalletNotFoundOrNotActiveError>
  > {
    const defaultUserSettings = {
      masterWalletId: this.masterWalletId,
      permsGroup: cardPermsGroup,
      cardPrint: cardPrintId,
      designCode: designCode,
      pin: cardVirtualDefaultPin,
      paymentDailyLimit: paymentDailyLimit,
    }

    const body: PostCardsCreateVirtualInput = new PostCardsCreateVirtualInput({
      externalUserId: cardInput.externalEmployeeId,
      ...defaultUserSettings,
    })

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.post<TreezorCardsResponse>(apiPrefix + 'cards/CreateVirtual', {
            ...body,
          }),
        ),
      )
      const newCard = res.data.cards[0]
      // We need to activate the card
      firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${newCard.cardId}/Activate/`,
          ),
        ),
      )
      // We need to enroll the cards for 3DS
      firstValueFrom(
        rxjsFrom(
          client.post<TreezorCardsResponse>(
            apiPrefix + `cards/Register3DS?cardId=${newCard.cardId}`,
          ),
        ),
      )
      return Result.ok({
        externalCardId: newCard.cardId.toString(),
        publicToken: newCard.publicToken,
        embossedName: newCard.embossedName,
        suffix: newCard.maskedPan.slice(-4),
      })
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new UserOrWalletNotFoundOrNotActiveError(e))
    }
  }
  async requestPhysicalCard(
    externalCardId: string,
    externalEmployeeId: string,
    userAddress: BaasAddress,
  ): Promise<
    Result<boolean, NotFoundException | UserAddressNotAcceptedByBaasError>
  > {
    const res = await this.updateEmployeeAddress(
      externalEmployeeId,
      userAddress,
    )
    if (res.isErr) {
      return Result.err(res.error)
    }
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/ConvertVirtual/`,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async setPin(
    externalCardId: string,
    newPIN: string,
    confirmPIN: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutSetPinInput = {
      newPIN: newPIN,
      confirmPIN: confirmPIN,
    }

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/setPIN`,
            body,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async changePin(
    externalCardId: string,
    newPIN: string,
    confirmPIN: string,
    currentPIN?: string,
  ): Promise<Result<boolean, NotFoundException | WrongPinError>> {
    const body: PutChangePinInput = {
      currentPIN: currentPIN ? currentPIN : cardVirtualDefaultPin,
      newPIN: newPIN,
      confirmPIN: confirmPIN,
    }

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/ChangePIN`,
            body,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        if (e.message.includes("Impossible to change the card's PIN")) {
          return Result.err(new WrongPinError(e))
        }
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async displayCard(
    externalCardId: string,
  ): Promise<Result<string, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorCardImagesResponse>(
            apiPrefix + `cardimages?cardId=${externalCardId}`,
          ),
        ),
      )
      if (res.data.cardimages[0]) {
        return Result.ok(res.data.cardimages[0].file)
      }
      return Result.err(new NotFoundException())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async unlockPin(externalCardId: string): Promise<Result<boolean>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/UnblockPIN`,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  // TO REMOVE
  async updateBothCardDailyLimit(
    externalCardId: string,
    limitPaymentDay: number,
    paymentDailyLimit: number,
  ): Promise<Result<boolean>> {
    const body: PutCardLimitsInput = {
      limitPaymentDay: limitPaymentDay,
      paymentDailyLimit: paymentDailyLimit,
    }
    return this.putCardLimits(externalCardId, body)
  }
  async updateCardDailyLimit(
    externalCardId: string,
    limit: number,
  ): Promise<Result<boolean>> {
    const body: PutCardLimitsInput = {
      paymentDailyLimit: limit,
    }
    return this.putCardLimits(externalCardId, body)
  }
  async updateCardLifetimeLimit(
    externalCardId: string,
    limit: number,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutCardLimitsInput = {
      limitPaymentAll: limit,
    }
    return this.putCardLimits(externalCardId, body)
  }
  async activateOnlineOption(
    externalCardId: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutCardOptionsInputProps = {
      online: true,
    }
    return this.putCardOptions(externalCardId, body)
  }
  async deactivateOnlineOption(
    externalCardId: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutCardOptionsInputProps = {
      online: false,
    }
    return this.putCardOptions(externalCardId, body)
  }
  async activateNfcOption(
    externalCardId: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutCardOptionsInputProps = {
      nfc: true,
    }
    return this.putCardOptions(externalCardId, body)
  }
  async deactivateNfcOption(
    externalCardId: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutCardOptionsInputProps = {
      nfc: false,
    }
    return this.putCardOptions(externalCardId, body)
  }
  async updateCardOptions(
    externalCardId: string,
    options: PutCardOptionsInputProps,
  ): Promise<Result<boolean, NotFoundException>> {
    return this.putCardOptions(externalCardId, options)
  }
  async getCard(
    externalCardId: string,
  ): Promise<Result<BaasCardProps, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/`,
          ),
        ),
      )
      return Result.ok(treezorCardPropsToBaasCardProps(res.data.cards[0]))
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async lockCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>> {
    const res = await this.putLockStatus(externalCardId, LockStatus.LOCK)

    const body: PutCardDigitalizationsInput = new PutCardDigitalizationsInput({
      status: TreezorCardDigitalizationStatus.SUSPEND,
      reasonCode: TreezorCardDigitalizationReasonCodeSuspendTemporarly.OTHER,
    })
    await this.handleCardDigitalizations(cardDigitalizationIds, body, false)
    return res
  }
  async unlockCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>> {
    const res = await this.putLockStatus(externalCardId, LockStatus.UNLOCK)
    const body: PutCardDigitalizationsInput = new PutCardDigitalizationsInput({
      status: TreezorCardDigitalizationStatus.UNSUSPEND,
      reasonCode: TreezorCardDigitalizationReasonCodeSuspendTemporarly.OTHER,
    })
    await this.handleCardDigitalizations(cardDigitalizationIds, body, false)
    return res
  }
  async blockLostCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>> {
    const res = await this.putLockStatus(externalCardId, LockStatus.LOST)
    const body: DeleteCardDigitalizationsInput =
      new DeleteCardDigitalizationsInput({
        reasonCode:
          TreezorCardDigitalizationReasonCodeSuspendPermanently.DEVICE_LOST,
      })
    await this.handleCardDigitalizations(cardDigitalizationIds, body, true)
    return res
  }
  async blockStolenCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>> {
    const res = await this.putLockStatus(externalCardId, LockStatus.STOLEN)
    const body: DeleteCardDigitalizationsInput =
      new DeleteCardDigitalizationsInput({
        reasonCode:
          TreezorCardDigitalizationReasonCodeSuspendPermanently.DEVICE_STOLEN,
      })
    await this.handleCardDigitalizations(cardDigitalizationIds, body, true)
    return res
  }
  async blockDestroyedCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>> {
    const res = await this.putLockStatus(externalCardId, LockStatus.DESTROYED)
    const body: DeleteCardDigitalizationsInput =
      new DeleteCardDigitalizationsInput({
        reasonCode: TreezorCardDigitalizationReasonCodeSuspendPermanently.OTHER,
      })
    await this.handleCardDigitalizations(cardDigitalizationIds, body, true)
    return res
  }
  async createUser(
    userInput: CreateBaasUserProps,
  ): Promise<Result<string, UserEmailAddressAlreadyUsedError>> {
    const defaultUserSettings = {
      userType: TreezorUserType.PHYSICAL_USER_AND_ANONYMOUS_USER,
      specifiedUSPerson: false,
      title: TreezorUserTitle.M, // We do not care so M by default
      address1: duniaAddress, // We do not care so Dunia address by default
      postcode: duniaPostcode,
      city: duniaCity,
      country: duniaCountry,
    }

    const body: PostUsersInput = new PostUsersInput({
      email: userInput.email,
      lastname: userInput.lastname,
      firstname: userInput.firstname,
      mobile: userInput.mobile,
      birthday: userInput.birthday,
      ...defaultUserSettings,
    })

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(client.post<TreezorUsersResponse>(apiPrefix + 'users', body)),
      )
      return Result.ok(res.data.users[0].userId.toString())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        if (e.message.includes('The email is already used')) {
          return this.getUserIdByEmail(userInput.email)
        }
        throw new InternalServerErrorException(e)
      }
      return Result.err(new UserEmailAddressAlreadyUsedError(e))
    }
  }
  async getUser(
    externalUserId: string,
  ): Promise<Result<BaasUserProps, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorUsersResponse>(
            apiPrefix + `users/${externalUserId}/`,
          ),
        ),
      )
      return Result.ok(treezorUserPropsToBaasUserProps(res.data.users[0]))
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async getUserIdByEmail(
    email: string,
  ): Promise<Result<string, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorUsersResponse>(
            apiPrefix + `users?email=${encodeURIComponent(email)}`,
          ),
        ),
      )
      return Result.ok(res.data.users[0].userId.toString())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async deleteUser(
    externalUserId: string,
    email: string,
  ): Promise<Result<boolean, NotFoundException>> {
    const body = {
      // Just saying that the cancellation originated from us and not from treezor
      origin: 'USER',
    }
    const client = await this.treezorClient()
    try {
      const updateRes = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorUsersResponse>(
            apiPrefix + `users/${externalUserId}`,
            {
              email: email,
            },
          ),
        ),
      )
      if (!updateRes.data.users[0]) {
        return Result.err(new NotFoundException())
      }
      const res = await firstValueFrom(
        rxjsFrom(
          client.delete<TreezorUsersResponse>(
            apiPrefix + `users/${externalUserId}`,
            {
              data: body,
            },
          ),
        ),
      )
      if (res.data.users[0]) {
        return Result.ok(true)
      }
      return Result.err(new NotFoundException())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async updateEmployeeAddress(
    externalUserId: string,
    address: BaasAddress,
  ): Promise<Result<boolean, UserAddressNotAcceptedByBaasError>> {
    const res = await this.updateEmployee(externalUserId, address)
    return res.isOk ? res : Result.err(new UserAddressNotAcceptedByBaasError())
  }
  async updateEmployee(
    externalUserId: string,
    user: UpdateBaasUserProps,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutUsersInput = new PutUsersInput({
      email: user.email,
      lastname: user.lastname,
      firstname: user.firstname,
      mobile: user.mobile,
      birthday: user.birthday,
      city: user.city,
      postcode: user.postalCode,
      address1: user.street,
      address2: user.street2,
      address3: user.street3,
    })
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorUsersResponse>(
            apiPrefix + `users/${externalUserId}`,
            body,
          ),
        ),
      )
      if (res.data.users[0]) {
        return Result.ok(true)
      }
      return Result.err(new NotFoundException())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  async getWalletBalance(walletId: string): Promise<number> {
    throw new Error('Method not implemented.')
  }

  async emulateCardTransaction(
    transactionInput: EmulateCardTransactionProps,
  ): Promise<Result<boolean, CardNotFoundOrNotActiveError>> {
    const body: PostSimulationCardTransactionsInput =
      new PostSimulationCardTransactionsInput(transactionInput)

    const client = await this.treezorClient()
    try {
      await firstValueFrom(
        rxjsFrom(client.post<void>('simulation/' + 'cardtransactions', body)),
      )
      return Result.ok(true)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new CardNotFoundOrNotActiveError(e))
    }
  }

  async requestXPayCredential(
    externalCardId: string,
    tokenRequestor: XPayProvider,
    certificates?: string[],
    nonce?: string,
    nonceSignature?: string,
  ): Promise<
    Result<
      string,
      CardNotFoundOrNotActiveError | TokenRequestorNeedsCertificatesError
    >
  > {
    if (tokenRequestor === XPayProvider.APPLE && !certificates) {
      return Result.err(new TokenRequestorNeedsCertificatesError())
    }
    const body: RequestXPayCredentialInput = new RequestXPayCredentialInput({
      externalCardId,
      tokenRequestor,
      certificates,
      nonce,
      nonceSignature,
    })

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.post<TreezorIssuerInitiatedDigitizationDatasResponse>(
            apiPrefix + 'issuerInitiatedDigitizationDatas',
            body,
          ),
        ),
      )
      return Result.ok(res.data.issuerInitiatedDigitizationDatas[0].credential)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new CardNotFoundOrNotActiveError(e))
    }
  }

  async requestXPayCryptogram(
    credential: string,
  ): Promise<Result<string, CardNotFoundOrNotActiveError>> {
    const publicUrl = this.config.getStr('TREEZOR_PUBLIC_URL')
    const headers: TWithStringKeys = {
      Content: 'application/json',
    }
    const instance = axios.create({
      baseURL: publicUrl,
      timeout: 10000,
      headers,
    })

    instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const data = error?.response?.data
        const msg = data ? JSON.stringify(data, null, 2) : error.message
        this.logger.error(
          msg,
          null,
          `[${this.constructor.name}]:requestXPayCryptogram: Treezor Api Error for path ${error.request.path}`,
        )
        throw new UnprocessableEntityException(`Treezor Error: ${msg}`)
      },
    )
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          instance.get<TreezorIssuerInitiatedDigitizationDataResponse>(
            `issuerInitiatedDigitizationData?credential=${credential}`,
          ),
        ),
      )
      return Result.ok(res.data.issuerInitiatedDigitizationData)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new CardNotFoundOrNotActiveError(e))
    }
  }

  async getCardTransactionsByDate(
    from?: Date,
    to?: Date,
    cursor?: string,
  ): Promise<Result<GetCardTransactionsResponse>> {
    const client = await this.treezorClient(true, 60000)
    if (!cursor && !from) {
      return Result.err(new NotFoundException())
    }
    const params = cursor
      ? `cursor=${cursor}`
      : `createdDateFrom=${dateToTreezorDateFormat(from!)}` +
        (to ? `&createdDateTo=${dateToTreezorDateFormat(to)}` : '')
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorTransactionsResponseWithCursor>(
            apiPrefix + `cardtransactions?${params}`,
          ),
        ),
      )
      return Result.ok({
        data: res.data.cardTransactions.map((transaction) =>
          treezorTransactionPropsToBaasTransactionProps(transaction),
        ),
        cursor: res.data.cursor.next,
      })
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }

  async getCardTransactionsByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<Result<GetCardTransactionsResponse>> {
    const client = await this.treezorClient(true)
    const params = `paymentId=${externalPaymentId}`
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<TreezorTransactionsResponse>(
            apiPrefix + `cardtransactions?${params}`,
          ),
        ),
      )
      return Result.ok({
        data: res.data.cardtransactions.map((transaction) =>
          treezorTransactionPropsToBaasTransactionProps(transaction),
        ),
      })
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }

  async createBaasCardAcquisition(
    cardAcquisitionToken: string,
  ): Promise<Result<string, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.post<TreezorTopupCardResponse>(
            apiPrefix + `topups/cards/users/${this.masterUserId}/topupCards`,
            {
              token: cardAcquisitionToken,
            },
          ),
        ),
      )
      return Result.ok(res.data.topupCards[0].topupCardId.toString())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }

  async deleteBaasCardAcquisition(
    topupCardId: string,
  ): Promise<Result<string, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.delete<TreezorTopupCardResponse>(
            apiPrefix +
              `topups/cards/users/${this.masterUserId}/topupCards/${topupCardId}`,
          ),
        ),
      )
      return Result.ok(res.data.topupCards[0].topupCardId.toString())
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }

  async authorizePayin(
    amount: number,
    paymentProduct: string,
    topupCardId: string,
    firstname: string,
    lastname: string,
    email: string,
    address: Address,
    cardHolder: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    return this.createPayin(
      amount,
      paymentProduct,
      topupCardId,
      firstname,
      lastname,
      email,
      address,
      cardHolder,
      `EKIP*${description}`,
    )
  }

  async directPayin(
    amount: number,
    paymentProduct: string,
    topupCardId: string,
    firstname: string,
    lastname: string,
    email: string,
    address: Address,
    cardHolder: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    const authorization = await this.createPayin(
      amount,
      paymentProduct,
      topupCardId,
      firstname,
      lastname,
      email,
      address,
      cardHolder,
      `EKIP*${description}`,
    )

    logger.info(
      `[TreezorBaas]:  directPayin authorization: ${JSON.stringify(
        authorization,
      )}`,
    )

    if (authorization.isErr) {
      return authorization
    }
    const capture = await this.capturePayin(
      authorization.value.externalAuthorizationId,
      amount,
    )
    logger.info(
      `[TreezorBaas]:  directPayin capture: ${JSON.stringify(capture)}`,
    )

    if (capture.isErr) {
      return Result.err(capture.error)
    }
    return Result.ok({
      externalAuthorizationId: authorization.value.externalAuthorizationId,
      reference: capture.value,
      status: authorization.value.status,
    })
  }

  private async createPayin(
    amount: number,
    paymentProduct: string,
    topupCardId: string,
    firstname: string,
    lastname: string,
    email: string,
    address: Address,
    cardHolder: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    const externalCardAcquisitionId = generateExternalCardAcquisitionIdV2()
    const order: CreatePayinInput = {
      amount: Number(amount),
      currency: 'EUR',
      walletId: this.masterWalletId.toString(),
      userId: this.masterUserId.toString(),
      topupCardId: topupCardId,
      acceptUrl: 'https://ekip.com',
      declineUrl: 'https://ekip.com',
      pendingUrl: 'https://ekip.com',
      exceptionUrl: 'https://ekip.com',
      cancelUrl: 'https://ekip.com',
      eci: '9',
      authenticationIndicator: '2',
      orderId: getOrderIdV2(externalCardAcquisitionId),
      description: description ? description : `EKIP`,
      messageToUser: description ? description : `EKIP`,
      paymentProduct: paymentProduct,
      deviceChannel: 1,
      browserInfo: {
        javaEnabled: false,
        javascriptEnabled: true,
        ipaddr: '0.0.0.0',
        httpAccept: 'https://ekip.com',
        httpUserAgent: 'https://ekip.com',
        language: 'FR',
        colorDepth: 1,
        screenHeight: 10,
        screenWidth: 10,
        timezone: '0',
        deviceFingerprint: 'rng',
      },
      country: 'FR',
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: '+33600000000',
      streetAddress: address.street ? address.street : '',
      city: address.city ? address.city : '',
      zipCode: address.postalCode ? address.postalCode : '',
      cardHolder: cardHolder,
    }

    return this.createAuthorizePayin(order)
  }

  private async createAuthorizePayin(
    payinInput: CreatePayinInput,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>> {
    const client = await this.treezorClient()
    const res = await firstValueFrom(
      rxjsFrom(
        client.post<TreezorCardAuthorizationResponse>(
          apiPrefix + `topups/cards/authorizations`,
          payinInput,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    )
    if (!res.data.authorizations[0].authorizationId) {
      throw new CardAcquisitionServiceError('No authorizationId in transaction')
    }
    const authorization = new TreezorCardAuthorization(
      res.data.authorizations[0],
    )
    return Result.ok({
      reference: authorization.transactionReference,
      externalAuthorizationId: authorization.authorizationId.value,
      status: authorization.status,
    })
  }

  async cancelPayin(
    authorizationId: string,
  ): Promise<Result<string, CardAcquisitionServiceError>> {
    const client = await this.treezorClient()
    const res = await firstValueFrom(
      rxjsFrom(
        client.delete<HipayTransaction>(
          apiPrefix + `topups/cards/authorizations/${authorizationId}`,
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

  async capturePayin(
    authorizationId: string,
    amount: number,
  ): Promise<Result<string, CardAcquisitionServiceError>> {
    const client = await this.treezorClient()
    const order = {
      currency: 'EUR',
      amount: Number(amount),
    }
    const res = await firstValueFrom(
      rxjsFrom(
        client.post<TreezorPayins>(
          apiPrefix + `topups/cards/authorizations/${authorizationId}/payins`,
          order,
        ),
      ),
    )
    logger.info(`[TreezorBaas]: capturePayin: ${JSON.stringify(res.data)}`)
    if (res instanceof Error) {
      return Result.err(new CardAcquisitionServiceError(res))
    }
    if (!res.data.payins[0].payinId) {
      return Result.err(
        new CardAcquisitionServiceError('No payinId in transaction'),
      )
    }
    const formattedPayload = treezorPayinPropsToBaasPayinProps(
      res.data.payins[0],
    )
    if (!formattedPayload.transactionReference) {
      return Result.err(
        new CardAcquisitionServiceError('No reference in transaction'),
      )
    }
    return Result.ok(formattedPayload.transactionReference)
  }

  async healthcheck(): Promise<boolean> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.get<{ balances: any[] }>(apiPrefix + `balances`, {
            params: {
              walletId: this.masterWalletId,
            },
          }),
        ),
      )
      return res.data.balances.length > 0
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return false
    }
  }

  private async treezorClient(
    withAccessToken = true,
    timeout = 100000,
  ): Promise<AxiosInstance> {
    const baseUrl = this.config.getStr('TREEZOR_URL')
    const headers: TWithStringKeys = {
      Content: 'application/json',
    }
    if (withAccessToken) {
      const token = await this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: timeout,
      headers,
    })

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const data = error?.response?.data
        const msg = data ? JSON.stringify(data, null, 2) : error.message
        this.logger.error(
          msg,
          null,
          `[${this.constructor.name}]: Treezor Api Error for path ${error.request.path}`,
        )
        throw new UnprocessableEntityException(`Treezor Error: ${msg}`)
      },
    )

    return this.axiosInstance
  }

  private async getAuthToken() {
    const grant_type = 'client_credentials'
    let token = await this.redis.ioredis.get(grant_type)
    if (token) return token

    const client = await this.treezorClient(false)

    const clientId = this.config.getStr('TREEZOR_ID')
    const secret = this.config.getStr('TREEZOR_SECRET')

    const res = await firstValueFrom(
      rxjsFrom(
        client.post<AuthenticationResponse>('oauth/token', {
          client_id: clientId,
          client_secret: secret,
          grant_type: grant_type,
        }),
      ),
    )

    token = res.data.access_token

    await this.redis.ioredis.set(
      grant_type,
      token,
      'EX',
      getCacheTime(CacheTimes.OneHour - CacheTimes.FifteenMinutes),
    )
    return token
  }

  private async putCardLimits(
    externalCardId: string,
    body: PutCardLimitsInput,
  ): Promise<Result<boolean, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/Limits/`,
            body,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  private async putCardOptions(
    externalCardId: string,
    body: PutCardOptionsInputProps,
  ): Promise<Result<boolean, NotFoundException>> {
    const card = await this.getCard(externalCardId)
    if (card.isErr) {
      return Result.err(card.error)
    }
    const fullBody = new PutCardOptionsInput({
      nfc: card.value.optionNfc === 1,
      online: card.value.optionOnline === 1,
      foreign: card.value.optionForeign === 1,
      atm: card.value.optionAtm === 1,
      ...body,
    })
    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/Options/`,
            fullBody,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      if (e.status !== '200' || '201') {
        throw new InternalServerErrorException(e)
      }
      return Result.err(new NotFoundException(e))
    }
  }
  private async putLockStatus(
    externalCardId: string,
    lockStatus: LockStatus,
  ): Promise<Result<boolean, NotFoundException>> {
    const body: PutLockUnlockCardInput = new PutLockUnlockCardInput({
      lockStatus: lockStatus,
    })

    const client = await this.treezorClient()
    try {
      const res = await firstValueFrom(
        rxjsFrom(
          client.put<TreezorCardsResponse>(
            apiPrefix + `cards/${externalCardId}/LockUnlock/`,
            body,
          ),
        ),
      )
      if (res.data.cards[0]) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      return Result.err(new NotFoundException(e))
    }
  }
  private async handleCardDigitalizations(
    cardDigitalizationIds: string[],
    body: PutCardDigitalizationsInput | DeleteCardDigitalizationsInput,
    doDelete: boolean,
  ): Promise<Result<boolean, NotFoundException>> {
    const client = await this.treezorClient()
    try {
      const resArray: TreezorCardDigitalization[] = []
      for await (const cardDigitalizationId of cardDigitalizationIds) {
        try {
          const res = await firstValueFrom(
            doDelete === true
              ? rxjsFrom(
                  client.delete<TreezorCardDigitalizationsResponse>(
                    apiPrefix + `cardDigitalizations/${cardDigitalizationId}`,
                    {
                      data: body,
                    },
                  ),
                )
              : rxjsFrom(
                  client.put<TreezorCardDigitalizationsResponse>(
                    apiPrefix + `cardDigitalizations/${cardDigitalizationId}`,
                    body,
                  ),
                ),
          )
          resArray.push(...res.data.cardDigitalizations)
        } catch (e) {
          logger.warn(
            `[${this.constructor.name}]:handleCardDigitalizations: Error while updating cardDigitalizations: ${cardDigitalizationId}`,
          )
        }
      }
      if (resArray.length === cardDigitalizationIds.length) {
        return Result.ok(true)
      }
      return Result.ok(false)
    } catch (e: any) {
      return Result.err(new NotFoundException(e))
    }
  }
}
