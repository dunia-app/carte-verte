import bcrypt from 'bcrypt'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  OrganizationAdminAlreadyActivatedError,
  OrganizationAdminNotActivatedError,
  OrganizationAdminPasswordFormatNotCorrectError,
  OrganizationAdminPasswordTooManyFailedAttemptError,
  OrganizationAdminRefreshTokenError,
  WrongOrganizationAdminPasswordError,
} from '../../errors/organization-admin.errors'
import { OrganizationAdminAskNewLoginTokenDomainEvent } from '../events/organization-admin-ask-new-login-token.domain-event'
import { OrganizationAdminAskResetPasswordDomainEvent } from '../events/organization-admin-ask-reset-password.domain-event'
import { OrganizationAdminCreatedDomainEvent } from '../events/organization-admin-created.domain-event'
import { OrganizationAdminTooManyFailedPasswordAttemptDomainEvent } from '../events/organization-admin-too-many-failed-password-attempt.domain-event'
import { OrganizationAdminPassword } from '../value-objects/organization-admin-password.value-object'
import { RefreshToken } from '../value-objects/refresh-token.value-object'
import { OrganizationAdminStatus } from './organization-admin.types'

const maxRefreshTokens = 5
export interface CreateOrganizationAdminProps {
  userId: UUID
  organizationsIds: UUID[]
}

export interface OrganizationAdminProps extends CreateOrganizationAdminProps {
  activatedAt?: DateVO
  password?: OrganizationAdminPassword
  refreshTokens: RefreshToken[]
  passwordFailedAttemps: number
}

export class OrganizationAdminEntity extends AggregateRoot<OrganizationAdminProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateOrganizationAdminProps,
    sendCreationEvent: boolean = true,
  ): OrganizationAdminEntity {
    const id = UUID.generate()
    const props: OrganizationAdminProps = {
      ...create,
      refreshTokens: [],
      passwordFailedAttemps: 0,
    }
    const organizationAdmin = new OrganizationAdminEntity({ id, props })

    if (sendCreationEvent) {
      organizationAdmin.addEvent(
        new OrganizationAdminCreatedDomainEvent({
          aggregateId: id.value,
          userId: props.userId.value,
          organizationId: create.organizationsIds[0].value,
        }),
      )
    }
    return organizationAdmin
  }

  get organizationsIds(): string[] {
    return this.props?.organizationsIds?.map((it) => it.value) ?? []
  }

  get userId(): UUID {
    return this.props.userId
  }

  get isActive(): boolean {
    return !isUndefined(this.props.activatedAt)
  }

  get status(): OrganizationAdminStatus {
    return this.isActive
      ? OrganizationAdminStatus.ORGANIZATION_ADMIN_ACTIVE
      : OrganizationAdminStatus.ORGANIZATION_ADMIN_UNACTIVE
  }

  get hasFailedPasswordTooManyTimes(): boolean {
    return this.props.passwordFailedAttemps >= 3
  }

  public async changePassword(
    currentPassword: string,
    newPassword: string,
    saltRound: number,
  ): Promise<
    Result<
      String,
      | OrganizationAdminPasswordFormatNotCorrectError
      | WrongOrganizationAdminPasswordError
    >
  > {
    if (!this.isActive) {
      return Result.err(
        new OrganizationAdminNotActivatedError(
          'You need to be active to login. Please activate your account first.',
        ),
      )
    }

    const r = bcrypt.compareSync(currentPassword, this.props.password!.value)
    if (!r) {
      return Result.err(new WrongOrganizationAdminPasswordError())
    }
    this.props.passwordFailedAttemps = 0

    const validation = this.validatePasswordFormat(newPassword)
    if (validation.isErr) {
      return Result.err(validation.error)
    }

    this.props.password = new OrganizationAdminPassword(
      bcrypt.hashSync(newPassword, saltRound),
    )

    return Result.ok('Password changed')
  }

  public addOrganization(organizationId: UUID): void {
    this.props.organizationsIds.push(organizationId)
  }

  public removeOrganization(organizationId: UUID): void {
    this.props.organizationsIds = this.props.organizationsIds.filter(
      (it) => it.value !== organizationId.value,
    )
  }

  public isOrganizationAccessible(organizationId: UUID): boolean {
    return this.props.organizationsIds.some(
      (it) => it.value === organizationId.value,
    )
  }

  public async setPassword(
    password: string,
    saltRound: number,
  ): Promise<Result<string, OrganizationAdminPasswordFormatNotCorrectError>> {
    const validation = this.validatePasswordFormat(password)
    if (validation.isErr) {
      return Result.err(validation.error)
    }
    if (!this.isActive) {
      this.props.activatedAt = DateVO.now()
    }
    const { refreshToken, unencryptedToken } = RefreshToken.generate(saltRound)
    this.props.refreshTokens = [refreshToken]
    this.props.password = new OrganizationAdminPassword(
      bcrypt.hashSync(password, saltRound),
    )
    this.props.passwordFailedAttemps = 0
    return Result.ok(unencryptedToken)
  }

  public async login(
    password: string,
    saltRound: number,
  ): Promise<
    Result<
      string,
      | OrganizationAdminNotActivatedError
      | WrongOrganizationAdminPasswordError
      | OrganizationAdminPasswordTooManyFailedAttemptError
    >
  > {
    if (!this.isActive) {
      return Result.err(
        new OrganizationAdminNotActivatedError(
          'You need to be active to login. Please activate your account first.',
        ),
      )
    }
    if (this.hasFailedPasswordTooManyTimes) {
      return Result.err(
        new OrganizationAdminPasswordTooManyFailedAttemptError(),
      )
    }

    const r = bcrypt.compareSync(password, this.props.password!.value)
    if (!r) {
      this.props.passwordFailedAttemps++
      if (this.hasFailedPasswordTooManyTimes) {
        this.addEvent(
          new OrganizationAdminTooManyFailedPasswordAttemptDomainEvent({
            aggregateId: this.id.value,
            userId: this.props.userId.value,
          }),
        )
        return Result.err(
          new OrganizationAdminPasswordTooManyFailedAttemptError(),
        )
      } else {
        return Result.err(new WrongOrganizationAdminPasswordError())
      }
    } else {
      this.props.passwordFailedAttemps = 0
    }

    const { refreshToken, unencryptedToken } = RefreshToken.generate(saltRound)

    if (this.props.refreshTokens.length > maxRefreshTokens) {
      this.props.refreshTokens.pop()
    }
    this.props.refreshTokens.unshift(refreshToken)
    return Result.ok(unencryptedToken)
  }

  public refreshToken(
    oldToken: string,
    saltRound: number,
  ): Result<
    string,
    OrganizationAdminRefreshTokenError | OrganizationAdminNotActivatedError
  > {
    if (!this.isActive) {
      return Result.err(
        new OrganizationAdminNotActivatedError(
          'You need to be active to login. Please activate your account first.',
        ),
      )
    }
    const oldRefreshTokenIndex = this.props.refreshTokens.findIndex((it) =>
      it.isTokenCorrect(oldToken),
    )
    if (oldRefreshTokenIndex < 0) {
      return Result.err(new OrganizationAdminRefreshTokenError())
    } else {
      const { refreshToken, unencryptedToken } = RefreshToken.generate(
        saltRound,
        undefined,
        this.props.refreshTokens[oldRefreshTokenIndex],
      )

      // Replace old one by new one
      this.props.refreshTokens.splice(oldRefreshTokenIndex, 1, refreshToken)
      return Result.ok(unencryptedToken)
    }
  }

  public isRefreshTokenCorrect(token: string): boolean {
    return !!this.props.refreshTokens.find((it) => it.isTokenCorrect(token))
  }

  askResetPassword(): Result<boolean, OrganizationAdminNotActivatedError> {
    if (!this.isActive) {
      return Result.err(
        new OrganizationAdminNotActivatedError(
          'You need to be active to reset your code. Please activate your account first.',
        ),
      )
    }

    this.addEvent(
      new OrganizationAdminAskResetPasswordDomainEvent({
        aggregateId: this.id.value,
        userId: this.props.userId.value,
      }),
    )
    return Result.ok(true)
  }

  askNewLoginToken(): Result<boolean, OrganizationAdminAlreadyActivatedError> {
    if (this.isActive) {
      return Result.err(
        new OrganizationAdminAlreadyActivatedError(
          'You can only ask for new login token before activating your account. Use askResetPassword if you forgot your code',
        ),
      )
    }

    this.addEvent(
      new OrganizationAdminAskNewLoginTokenDomainEvent({
        aggregateId: this.id.value,
        userId: this.props.userId.value,
      }),
    )
    return Result.ok(true)
  }

  public validate(): void {}

  public validatePasswordFormat(
    password: string,
  ): Result<null, OrganizationAdminPasswordFormatNotCorrectError> {
    if (password.length < 8) {
      return Result.err(
        new OrganizationAdminPasswordFormatNotCorrectError(
          'Password must be at least 8 long',
        ),
      )
    }
    if (!/(?=.*?[0-9])/.test(password)) {
      return Result.err(
        new OrganizationAdminPasswordFormatNotCorrectError(
          'Password must contain at least one digit',
        ),
      )
    }
    if (!/(?=.*?[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return Result.err(
        new OrganizationAdminPasswordFormatNotCorrectError(
          'Password must contain at least one special caracter (!@#$%^&*(),.?":{}|<>)',
        ),
      )
    }
    return Result.ok(null)
  }
}
