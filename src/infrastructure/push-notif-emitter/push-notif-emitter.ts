import { Injectable } from '@nestjs/common'
import { messaging } from 'firebase-admin'
import { FirebasePushNotifEmitter } from '../../libs/ddd/infrastructure/push-notif-emitter/firebase.push-notif-emitter.base'

export type TokenMessage = messaging.Message & { token: string }

@Injectable()
export class PushNotifEmitter extends FirebasePushNotifEmitter {}
