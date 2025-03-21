import { compareSync, hashSync } from 'bcrypt'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ArgumentInvalidException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { Name } from '../../../user/domain/value-objects/name.value-object'
import {
  DeviceIdAlreadyExistsError,
  EmployeeAlreadyAcceptedCguError,
  EmployeeAlreadyActivatedError,
  EmployeeAlreadyFrozenError,
  EmployeeAlreadyRemovedError,
  EmployeeAlreadyUnfrozenError,
  EmployeeBalanceNotZeroError,
  EmployeeCodeFormatNotCorrectError,
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeExternalIdAlreadySetError,
  EmployeeExternalIdNotSetError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotRemovedError,
  EmployeeNotToBeDeletedError,
  EmployeeRefreshTokenError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { EmployeeActivatedDomainEvent } from '../events/employee-activated.domain-event'
import { EmployeeAskNewLoginTokenDomainEvent } from '../events/employee-ask-new-login-token.domain-event'
import { EmployeeAskNewSmsTokenDomainEvent } from '../events/employee-ask-new-sms-token.domain-event'
import { EmployeeAskResetCodeDomainEvent } from '../events/employee-ask-reset-code.domain-event'
import { EmployeeCodeTooManyFailedAttemptDomainEvent } from '../events/employee-code-too-many-failed-attempt.domain-event'
import { EmployeeCreatedDomainEvent } from '../events/employee-created.domain-event'
import { EmployeeDeletedDomainEvent } from '../events/employee-deleted.domain-event'
import { EmployeeFrozenDomainEvent } from '../events/employee-frozen.domain-event'
import { EmployeeHasAcceptedCguDomainEvent } from '../events/employee-has-accepted-cgu.domain-event'
import { EmployeeUnfrozenDomainEvent } from '../events/employee-unfrozen.domain-event'
import {
  BooleanByWeekday,
  BooleanByWeekdayProps,
} from '../value-objects/boolean-by-weekday.value-object'
import { EmployeeCode } from '../value-objects/employee-code.value-object'
import { RefreshToken } from '../value-objects/refresh-token.value-object'
import { EmployeeStatus } from './employee.types'
const cryptoRandomString = require('crypto-random-string')
import moment = require('moment')
import _ = require('lodash')

const delayBetweenRemovalAndDeletion = [3, 'month']
const maxRefreshTokens = 5

export interface CreateEmployeeProps {
  organizationId: UUID
  userId: UUID
  mealTicketDays: BooleanByWeekday
  birthday: DateVO
  defaultAuthorizedOverdraft: number
}

export interface EmployeeProps extends CreateEmployeeProps {
  codeFailedAttemps: number
  externalEmployeeId?: string
  activatedAt?: DateVO
  cguAcceptedAt?: DateVO
  freezedAt?: DateVO | null
  code?: EmployeeCode
  refreshTokens: RefreshToken[]
  willBeDeletedAt?: DateVO | null
  deviceIds: string[]
}

export class EmployeeEntity extends AggregateRoot<EmployeeProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateEmployeeProps): EmployeeEntity {
    const id = UUID.generate()
    const props: EmployeeProps = {
      ...create,
      refreshTokens: [],
      deviceIds: [],
      codeFailedAttemps: 0,
    }
    const employee = new EmployeeEntity({ id, props })

    employee.addEvent(
      new EmployeeCreatedDomainEvent({
        aggregateId: id.value,
        userId: props.userId.value,
        organizationId: props.organizationId.value,
      }),
    )
    return employee
  }

  get organizationId(): UUID {
    return this.props.organizationId
  }

  get userId(): UUID {
    return this.props.userId
  }

  get externalEmployeeId() {
    return this.props.externalEmployeeId
  }

  get isActive(): boolean {
    return !isUndefined(this.props.activatedAt)
  }

  get hasAcceptedCgu(): boolean {
    return !isUndefined(this.props.cguAcceptedAt)
  }

  get isFrozen(): boolean {
    return !isUndefined(this.props.freezedAt)
  }

  get isBaasUser(): boolean {
    return !isUndefined(this.props.externalEmployeeId)
  }

  get status(): EmployeeStatus {
    return this.isActive
      ? EmployeeStatus.EMPLOYEE_ACTIVE
      : EmployeeStatus.EMPLOYEE_UNACTIVE
  }

  get hasFailedCodeTooManyTimes(): boolean {
    return this.props.codeFailedAttemps >= 3
  }

  get willBeDeleted(): boolean {
    return !isUndefined(this.props.willBeDeletedAt)
  }

  get birthday(): Date {
    return this.props.birthday.value
  }

  get mealTicketDays() {
    return this.props.mealTicketDays
  }

  get isSundayWorker() {
    return this.props.mealTicketDays.SUNDAY
  }

  set birthday(birthday: Date) {
    this.props.birthday = new DateVO(birthday)
  }

  set mealTicketDays(mealTicketDays: BooleanByWeekdayProps) {
    this.props.mealTicketDays = new BooleanByWeekday(mealTicketDays)
  }

  set organizationId(organizationId: UUID) {
    this.props.organizationId = organizationId
  }

  get defaultAuthorizedOverdraft(): number {
    return Number(this.props.defaultAuthorizedOverdraft)
  }

  public acceptCgu(): Result<
    null,
    EmployeeAlreadyAcceptedCguError | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (this.hasAcceptedCgu) {
      return Result.err(new EmployeeAlreadyAcceptedCguError())
    }
    this.props.cguAcceptedAt = DateVO.now()
    this.addEvent(
      new EmployeeHasAcceptedCguDomainEvent({
        aggregateId: this.id.value,
        userId: this.props.userId.value,
      }),
    )
    return Result.ok(null)
  }

  public setExternalId(
    externalEmployeeId: string,
  ): Result<true, EmployeeExternalIdAlreadySetError> {
    if (!this.isBaasUser) {
      this.props.externalEmployeeId = externalEmployeeId
      return Result.ok(true)
    }
    return Result.err(new EmployeeExternalIdAlreadySetError())
  }

  public async setCode(
    code: string,
    saltRound: number,
    deviceId?: string,
  ): Promise<
    Result<
      string,
      | EmployeeCodeFormatNotCorrectError
      | EmployeeExternalIdNotSetError
      | EmployeeFrozenError
    >
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    const validation = this.validateCodeFormat(code)
    if (validation.isErr) {
      return Result.err(validation.error)
    }
    if (!this.isActive) {
      this.props.activatedAt = DateVO.now()
      this.addEvent(
        new EmployeeActivatedDomainEvent({
          aggregateId: this.id.value,
          userId: this.props.userId.value,
          organizationId: this.props.organizationId.value,
        }),
      )
    }
    const { refreshToken, unencryptedToken } = RefreshToken.generate(
      saltRound,
      deviceId,
    )
    this.props.refreshTokens = [refreshToken]
    this.props.code = new EmployeeCode(hashSync(code, saltRound))
    this.props.codeFailedAttemps = 0
    return Result.ok(unencryptedToken)
  }

  public login(
    code: string,
    saltRound: number,
    deviceId?: string,
  ): Result<
    string,
    | EmployeeNotActivatedError
    | WrongEmployeeCodeError
    | EmployeeCodeTooManyFailedAttemptError
    | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (!this.isActive) {
      return Result.err(
        new EmployeeNotActivatedError(
          'You need to be active to login. Please activate your account first.',
        ),
      )
    }

    const res = this.checkCode(code)
    if (res.isErr) {
      return Result.err(res.error)
    } else {
      const { refreshToken, unencryptedToken } = RefreshToken.generate(
        saltRound,
        deviceId,
      )

      if (this.props.refreshTokens.length > maxRefreshTokens) {
        this.props.refreshTokens.pop()
      }
      this.props.refreshTokens.unshift(refreshToken)
      return Result.ok(unencryptedToken)
    }
  }

  public logout(
    refreshToken: string,
  ): Result<boolean, EmployeeNotActivatedError | EmployeeFrozenError> {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (!this.isActive) {
      return Result.err(
        new EmployeeNotActivatedError(
          'You need to be active to logout. Please activate your account first.',
        ),
      )
    }
    const oldRefreshTokenIndex = this.props.refreshTokens.findIndex((it) =>
      it.isTokenCorrect(refreshToken),
    )
    if (oldRefreshTokenIndex < 0) {
      return Result.err(new EmployeeRefreshTokenError())
    } else {
      // Remove old one
      this.props.refreshTokens.splice(oldRefreshTokenIndex, 1)
      return Result.ok(true)
    }
  }

  public refreshToken(
    oldToken: string,
    saltRound: number,
    deviceId?: string,
  ): Result<
    string,
    EmployeeRefreshTokenError | EmployeeNotActivatedError | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (!this.isActive) {
      return Result.err(
        new EmployeeNotActivatedError(
          'You need to be active to login. Please activate your account first.',
        ),
      )
    }
    const oldRefreshTokenIndex = this.props.refreshTokens.findIndex((it) =>
      it.isTokenCorrect(oldToken),
    )
    if (oldRefreshTokenIndex < 0) {
      return Result.err(new EmployeeRefreshTokenError())
    } else {
      const oldResfreshToken = this.props.refreshTokens[oldRefreshTokenIndex]
      if (
        oldResfreshToken.deviceId &&
        deviceId &&
        oldResfreshToken.deviceId !== deviceId
      ) {
        return Result.err(new EmployeeRefreshTokenError())
      }
      const { refreshToken, unencryptedToken } = RefreshToken.generate(
        saltRound,
        deviceId,
        oldResfreshToken,
      )

      // Replace old one by new one
      this.props.refreshTokens.splice(oldRefreshTokenIndex, 1, refreshToken)
      return Result.ok(unencryptedToken)
    }
  }

  public isRefreshTokenCorrect(token: string): boolean {
    return !!this.props.refreshTokens.find((it) => it.isTokenCorrect(token))
  }

  public checkCode(
    code: string,
  ): Result<
    true,
    | WrongEmployeeCodeError
    | EmployeeCodeTooManyFailedAttemptError
    | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (this.hasFailedCodeTooManyTimes) {
      return Result.err(new EmployeeCodeTooManyFailedAttemptError())
    }
    const r = compareSync(code, this.props.code!.value)
    if (!r) {
      this.props.codeFailedAttemps++
      if (this.hasFailedCodeTooManyTimes) {
        this.addEvent(
          new EmployeeCodeTooManyFailedAttemptDomainEvent({
            aggregateId: this.id.value,
            userId: this.userId.value,
          }),
        )
        return Result.err(new EmployeeCodeTooManyFailedAttemptError())
      }
      return Result.err(
        new WrongEmployeeCodeError(this.props.codeFailedAttemps),
      )
    } else {
      this.props.codeFailedAttemps = 0
    }

    return Result.ok(true)
  }

  askResetCode(): Result<
    boolean,
    EmployeeNotActivatedError | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    if (!this.isActive) {
      return Result.err(
        new EmployeeNotActivatedError(
          'You need to be active to reset your code. Please activate your account first.',
        ),
      )
    }

    this.addEvent(
      new EmployeeAskResetCodeDomainEvent({
        aggregateId: this.id.value,
        userId: this.props.userId.value,
      }),
    )
    return Result.ok(true)
  }

  askNewLoginToken(): Result<
    boolean,
    EmployeeAlreadyActivatedError | EmployeeFrozenError
  > {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }

    this.addEvent(
      new EmployeeAskNewLoginTokenDomainEvent({
        aggregateId: this.id.value,
        userId: this.props.userId.value,
      }),
    )
    return Result.ok(true)
  }

  askNewSmsToken(
    mobile: string,
    email: string,
    deviceId?: string,
  ): Result<string, EmployeeFrozenError> {
    if (this.isFrozen) {
      return Result.err(new EmployeeFrozenError())
    }
    const mobileToken = cryptoRandomString({ length: 10, type: 'numeric' })

    this.addEvent(
      new EmployeeAskNewSmsTokenDomainEvent({
        aggregateId: this.id.value,
        email: email,
        mobile: mobile,
        mobileToken: mobileToken,
        deviceId: deviceId,
      }),
    )
    return Result.ok(mobileToken)
  }

  freeze(): Result<true, EmployeeAlreadyFrozenError> {
    if (this.isFrozen) {
      return Result.err(new EmployeeAlreadyFrozenError())
    }
    this.props.freezedAt = new DateVO(new Date())
    this.addEvent(
      new EmployeeFrozenDomainEvent({
        aggregateId: this.id.value,
      }),
    )
    return Result.ok(true)
  }

  unfreeze(): Result<true, EmployeeAlreadyUnfrozenError> {
    if (!this.isFrozen) {
      return Result.err(new EmployeeAlreadyUnfrozenError())
    }
    this.props.freezedAt = null
    this.addEvent(
      new EmployeeUnfrozenDomainEvent({
        aggregateId: this.id.value,
      }),
    )
    return Result.ok(true)
  }

  remove(): Result<true, EmployeeAlreadyRemovedError> {
    if (this.willBeDeleted) {
      return Result.err(new EmployeeAlreadyRemovedError())
    }
    // We set the date just before the delete_removed_employee task
    // Which runs every sunday at 00:00
    this.props.willBeDeletedAt = new DateVO(
      moment()
        .add(...delayBetweenRemovalAndDeletion)
        .add(1, 'week')
        .startOf('week')
        .subtract(1, 'hour')
        .toLocaleString(),
    )
    return Result.ok(true)
  }

  unremove(): Result<true, EmployeeNotRemovedError> {
    if (!this.willBeDeleted) {
      return Result.err(new EmployeeNotRemovedError())
    }
    this.props.willBeDeletedAt = null
    return Result.ok(true)
  }

  delete(
    name: Name,
    balanceLeftTotal: number,
    authorizedBalanceLeftTotal: number,
  ): Result<true, EmployeeNotToBeDeletedError | EmployeeBalanceNotZeroError> {
    if (
      !this.props.willBeDeletedAt ||
      this.props.willBeDeletedAt!.value > new Date()
    ) {
      return Result.err(new EmployeeNotToBeDeletedError())
    }
    // Only delete employee that have no balance
    if (authorizedBalanceLeftTotal !== 0 || balanceLeftTotal !== 0) {
      return Result.err(new EmployeeBalanceNotZeroError())
    }
    // We store all this info for audit purpose
    this.addEvent(
      new EmployeeDeletedDomainEvent({
        aggregateId: this.id.value,
        firstname: name.firstname,
        lastname: name.lastname,
        organizationId: this.props.organizationId.value,
        externalEmployeeId: this.props.externalEmployeeId,
      }),
    )
    return Result.ok(true)
  }

  pushDeviceIds(
    ...deviceIds: string[]
  ): Result<boolean, DeviceIdAlreadyExistsError> {
    const uniqueIds = _.union(this.props.deviceIds, deviceIds)
    if (uniqueIds.length !== this.props.deviceIds.length) {
      this.props.deviceIds = uniqueIds
      // Return true if : save is needed/previously unknown deviceId
      return Result.ok(true)
    }
    return Result.err(new DeviceIdAlreadyExistsError())
  }

  public validate(): void {
    if (
      (this.isActive && isUndefined(this.props.code)) ||
      (!this.isActive && !isUndefined(this.props.code))
    ) {
      throw new ArgumentInvalidException(
        'activated employee must have a code set and vice versa',
      )
    }
    if (this.props.codeFailedAttemps > 3 || this.props.codeFailedAttemps < 0) {
      throw new ArgumentInvalidException(
        'codeFailedAttemps must be between 0 and 3',
      )
    }
  }

  private validateCodeFormat(
    code: string,
  ): Result<null, EmployeeCodeFormatNotCorrectError> {
    if (code.length !== 4 || !isFinite(Number(code))) {
      return Result.err(new EmployeeCodeFormatNotCorrectError())
    }
    return Result.ok(null)
  }

  private static generateRefreshToken() {
    return cryptoRandomString({ length: 16, type: 'url-safe' })
  }
}
