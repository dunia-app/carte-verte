import { Result } from '@badrap/result'
import _ from 'lodash'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { DeviceTokenAlreadyExistsError } from '../../errors/receiver.errors'
import { DeviceToken } from '../value-objects/device-token.value-object'

export interface CreateReceiverProps {
  userId: UUID
  email: Email
}

export interface ReceiverProps extends CreateReceiverProps {
  deviceTokens: DeviceToken[]
  acceptEmail: boolean
  acceptNotification: boolean
  phoneNumber?: string
}

export class ReceiverEntity extends AggregateRoot<ReceiverProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateReceiverProps): ReceiverEntity {
    const id = UUID.generate()
    const props: ReceiverProps = {
      ...create,
      deviceTokens: [],
      acceptEmail: true,
      acceptNotification: true,
    }
    const receiver = new ReceiverEntity({ id, props })

    return receiver
  }

  get userId(): UUID {
    return this.props.userId
  }

  get email(): Email {
    return this.props.email
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber
  }

  get deviceTokens(): string[] {
    const tokens = this.props.deviceTokens.map((it) => it.deviceTokens).flat()
    return [...new Set(tokens)]
  }

  get acceptEmail(): boolean {
    return this.props.acceptEmail
  }

  get acceptNotification(): boolean {
    return this.props.acceptNotification
  }

  set acceptEmail(accept: boolean) {
    this.props.acceptEmail = accept
  }

  set acceptNotification(accept: boolean) {
    this.props.acceptNotification = accept
  }

  set email(email: Email) {
    this.props.email = email
  }

  set phoneNumber(phoneNumber: string | undefined) {
    this.props.phoneNumber = phoneNumber
  }

  pushDeviceTokens(
    deviceToken: string,
    deviceId?: string,
  ): Result<boolean, DeviceTokenAlreadyExistsError> {
    const currentDeviceId = deviceId ? deviceId : ''
    const { foundElement, foundIndex } =
      this.findDeviceIdTokenWithIndex(currentDeviceId)
    if (!foundElement) {
      this.props.deviceTokens.push(
        new DeviceToken({
          deviceId: currentDeviceId,
          deviceTokens: [deviceToken],
        }),
      )
      return Result.ok(true)
    }
    const uniqueTokens = _.union(foundElement.deviceTokens, [deviceToken])
    if (uniqueTokens.length !== this.props.deviceTokens.length) {
      const newDeviceToken = new DeviceToken({
        deviceId: currentDeviceId,
        deviceTokens: uniqueTokens,
      })
      this.props.deviceTokens.splice(foundIndex, 1, newDeviceToken)
      return Result.ok(true)
    }
    return Result.err(new DeviceTokenAlreadyExistsError())
  }

  popDeviceTokens(deviceId: string): Result<boolean> {
    const deviceTokenIndex = this.props.deviceTokens.findIndex(
      (it) => it.deviceId === deviceId,
    )
    if (deviceTokenIndex < 0) {
      return Result.ok(false)
    } else {
      // Remove old one
      this.props.deviceTokens.splice(deviceTokenIndex, 1)
      return Result.ok(true)
    }
  }

  findDeviceIdTokenWithIndex(deviceId: string): {
    foundElement?: DeviceToken
    foundIndex: number
  } {
    return this.props.deviceTokens.reduce(
      (
        acc: { foundElement?: DeviceToken; foundIndex: number },
        el: DeviceToken,
        idx: number,
      ) => {
        if (el.deviceId === deviceId) {
          acc.foundElement = el
          acc.foundIndex = idx
        }
        return acc
      },
      { foundElement: undefined, foundIndex: -1 },
    )
  }

  public validate(): void {}
}
