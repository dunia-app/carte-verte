import { NotFoundError } from 'rxjs'
import {
  LockStatus,
  XPayProvider,
} from '../../../../modules/card/domain/entities/card.types'
import {
  PANEntryMethod,
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../../../modules/transaction/domain/entities/transaction.types'
import { ExceptionBase, NotFoundException } from '../../../exceptions/index'
import { PutCardOptionsInputProps } from '../../infrastructure/baas/dto/treezor-cards.dto'
import { Result } from '../utils/result.util'
import { Address } from '../value-objects/address.value-object'
import {
  CardAcquisitionPayinResult,
  CardAcquisitionServiceError,
} from './card-acquisition-service.port'

export interface CreateBaasUserProps {
  email: string
  lastname: string
  firstname: string
  mobile: string
  birthday: Date
}

export interface BaasUserProps {
  userId: string
  email: string
  lastname: string
  firstname: string
  mobile: string
  birthday: Date
  address: BaasAddress
}

export interface UpdateBaasUserProps
  extends Partial<CreateBaasUserProps & BaasAddress> {}

export interface BaasAddress {
  street: string
  street2: string
  street3?: string
  city: string
  postalCode: string
}

export interface CreateBaasCardProps {
  externalEmployeeId: string
}

export interface CreateBaasCardResponse {
  externalCardId: string
  publicToken: string
  embossedName: string
  suffix: string
}

export interface BaasCardProps {
  cardId: number
  publicToken: string
  limitPaymentDay: number
  limitPaymentAll: number
  statusCode: LockStatus
  embossedName: string
  maskedPan: string
  pinTryExceeds: number
  optionAtm: number
  optionForeign: number
  optionOnline: number
  optionNfc: number
}

export interface EmulateCardTransactionProps {
  publicToken: string
  paymentCode?: string
  paymentStatus: TransactionStatus
  date: Date
  amount: number
  mcc: string
  merchantId: string
}

export interface BaasTransactionProps {
  externalCardId: string
  mid: string
  mcc: string
  merchantName: string
  merchantCity: string
  merchantCountry: string
  merchantAddress?: string
  externalTransactionId: string
  externalPaymentId: string
  paymentDate: Date
  amount: number
  status: TransactionStatus
  authorizationNote: string
  authorizationResponseCode: string
  authorizationIssuerId: string
  authorizationMti: string
  declinedReason?: TransactionDeclinedReason
  panEntryMethod: PANEntryMethod
}

export interface GetCardTransactionsResponse {
  data: BaasTransactionProps[]
  cursor?: string
}

export interface BaasPayinProps {
  payinId: string
  amount: number
  status: string
  transactionReference?: string
}

// Maybe todo : add : Promise<Result<string, CustomError>> instead ?
export interface BaasPort {
  createVirtualCard(
    cardInput: CreateBaasCardProps,
  ): Promise<
    Result<CreateBaasCardResponse, UserOrWalletNotFoundOrNotActiveError>
  >
  requestPhysicalCard(
    externalCardId: string,
    externalEmployeeId: string,
    userAddress: BaasAddress,
    organizationName: string,
  ): Promise<
    Result<
      boolean,
      UserOrWalletNotFoundOrNotActiveError | UserAddressNotAcceptedByBaasError
    >
  >
  setPin(
    externalCardId: string,
    newPin: string,
    confirmPIN: string,
  ): Promise<Result<boolean, UserOrWalletNotFoundOrNotActiveError>>
  changePin(
    externalCardId: string,
    currentPin: string,
    newPin: string,
    confirmPIN: string,
  ): Promise<Result<boolean, NotFoundError | WrongPinError>>
  unlockPin(externalCardId: string): Promise<Result<boolean>>
  updateBothCardDailyLimit(
    externalCardId: string,
    limitPaymentDay: number,
    paymentDailyLimit: number,
  ): Promise<Result<boolean>>
  updateCardDailyLimit(
    externalCardId: string,
    limit: number,
  ): Promise<Result<boolean>>
  updateCardLifetimeLimit(
    externalCardId: string,
    limit: number,
  ): Promise<Result<boolean>>
  updateCardOptions(
    externalCardId: string,
    options: PutCardOptionsInputProps,
  ): Promise<Result<boolean, NotFoundException>>
  getCard(
    externalCardId: string,
  ): Promise<Result<BaasCardProps, NotFoundException>>
  lockCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>>
  unlockCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>>
  blockLostCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>>
  blockStolenCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>>
  blockDestroyedCard(
    externalCardId: string,
    cardDigitalizationIds: string[],
  ): Promise<Result<boolean, NotFoundException>>
  createUser(
    userInput: CreateBaasUserProps,
  ): Promise<Result<string, UserEmailAddressAlreadyUsedError>>
  deleteUser(
    externalUserId: string,
    email: string,
  ): Promise<Result<boolean, NotFoundException>>
  updateEmployeeAddress(
    externalUserId: string,
    address: BaasAddress,
  ): Promise<Result<boolean, UserAddressNotAcceptedByBaasError>>
  updateEmployee(
    externalUserId: string,
    body: UpdateBaasUserProps,
  ): Promise<Result<boolean, NotFoundException>>
  getWalletBalance(walletId: string): Promise<number>
  getCardTransactionsByDate(
    from: Date,
    to: Date,
  ): Promise<Result<GetCardTransactionsResponse>>
  getCardTransactionsByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<Result<GetCardTransactionsResponse>>
  createBaasCardAcquisition(
    cardAcquisitionToken: string,
  ): Promise<Result<string, NotFoundException>>
  deleteBaasCardAcquisition(
    topupCardId: string,
  ): Promise<Result<string, NotFoundException>>
  authorizePayin(
    amount: number,
    paymentProduct: string,
    topupCardId: string,
    firstname: string,
    lastname: string,
    email: string,
    address: Address,
    cardHolder: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>>
  directPayin(
    amount: number,
    paymentProduct: string,
    topupCardId: string,
    firstname: string,
    lastname: string,
    email: string,
    address: Address,
    cardHolder: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>>
  cancelPayin(
    authorizationId: string,
  ): Promise<Result<string, CardAcquisitionServiceError>>
  capturePayin(
    authorizationId: string,
    amount: number,
  ): Promise<Result<string, CardAcquisitionServiceError>>
  emulateCardTransaction(
    transactionInput: EmulateCardTransactionProps,
  ): Promise<Result<boolean, CardNotFoundOrNotActiveError>>
  requestXPayCredential(
    externalCardId: string,
    tokenRequestor: XPayProvider,
  ): Promise<
    Result<
      string,
      CardNotFoundOrNotActiveError | TokenRequestorNeedsCertificatesError
    >
  >
  requestXPayCryptogram(
    credential: string,
  ): Promise<Result<string, CardNotFoundOrNotActiveError>>
  healthcheck(): Promise<boolean>
}

export class UserOrWalletNotFoundOrNotActiveError extends ExceptionBase {
  static readonly message =
    'The user and the wallet provided must be created and active '

  public readonly code: string = 'USER_OR_WALLET.NOT_FOUND_OR_UNACTIVE'

  constructor(metadata?: unknown) {
    super(UserOrWalletNotFoundOrNotActiveError.message, metadata)
  }
}

export class UserAddressNotAcceptedByBaasError extends ExceptionBase {
  static readonly message = 'The user address provided has not been accepted'

  public readonly code: string = 'USER.ADDRESS_NOT_ACCEPTED_BY_BAAS'

  constructor(metadata?: unknown) {
    super(UserAddressNotAcceptedByBaasError.message, metadata)
  }
}

export class UserEmailAddressAlreadyUsedError extends ExceptionBase {
  static readonly message = 'The email is already used for another user'

  public readonly code: string = 'USER.EMAIL_ADDRESS_ALREADY_USED'

  constructor(metadata?: unknown) {
    super(UserEmailAddressAlreadyUsedError.message, metadata)
  }
}

export class CardNotFoundOrNotActiveError extends ExceptionBase {
  static readonly message = 'The card provided must exist and be active'

  public readonly code: string = 'CARD.NOT_FOUND_OR_UNACTIVE'

  constructor(metadata?: unknown) {
    super(CardNotFoundOrNotActiveError.message, metadata)
  }
}

export class TokenRequestorNeedsCertificatesError extends ExceptionBase {
  static readonly message =
    'This token requestor needs additionnal information for this request.'

  public readonly code: string =
    'CARD_DIGITALIZATION.TOKEN_REQUESTOR_MISSING_INFORMATION'

  constructor(metadata?: unknown) {
    super(TokenRequestorNeedsCertificatesError.message, metadata)
  }
}

export class WrongPinError extends ExceptionBase {
  static readonly message = 'Pin is incorrect'

  public readonly code: string = 'CARD.WRONG_PIN'

  constructor(metadata?: unknown) {
    super(WrongPinError.message, metadata)
  }
}
