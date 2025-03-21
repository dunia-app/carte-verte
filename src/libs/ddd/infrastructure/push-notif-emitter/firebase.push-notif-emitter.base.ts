import { Injectable } from '@nestjs/common'
import admin from 'firebase-admin'

@Injectable()
export class FirebasePushNotifEmitter {
  public readonly _messaging: admin.messaging.Messaging
  constructor() {
    let app: admin.app.App
    const firebaseConfig = process.env.GOOGLE_AUTHENTICATION_APP?.toString()

    if (firebaseConfig) {
      app = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(firebaseConfig)),
      })
    } else {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      })
    }

    this._messaging = app.messaging()
  }

  messaging() {
    return this._messaging
  }
}
