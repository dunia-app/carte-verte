import { INestApplication } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { createGzip } from 'zlib'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { MailNotificationTransportService } from '../../../../../modules/message/application/transport-handlers/mail-notification.transport-handler'
import { MessageRepository } from '../../../../../modules/message/database/message/message.repository'
import { NotificationRepository } from '../../../../../modules/message/database/notification/notification.repository'
import { ReceiverRepository } from '../../../../../modules/message/database/receiver/receiver.repository'
import { NotificationSendingResult } from '../../../../../modules/message/domain/entities/notification.types'
import { NotificationResponseVO } from '../../../../../modules/message/domain/value-objects/notification-response.value-object'
import { MessageModule } from '../../../../../modules/message/message.module'
import { buildTypedServices, createTestModule } from '../../../../../tests/test_utils'
import { MailNotificationInfo } from '../../../domain/ports/message-emitter.port'
import { MailjetMessageEmitter } from '../mailjet.message-emitter.base'
const fs = require('fs');

describe('MailjetMessageEmitter', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    commandBus: CommandBus,
    receiverRepo: ReceiverRepository,
    messageRepo: MessageRepository,
    notificationRepo : NotificationRepository,
    mailNotificationTransport : MailNotificationTransportService,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [MessageModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
  })


  describe('sendMails', () => {
    it('should send an email and return a success result', async () => {
      // Arrange
      const mailInfos: MailNotificationInfo[] = [
        {
          to : {
            email: "cyprien@ekip.app",
          },
          textPart: "Hello Cyprien",
        }
      ]

      const notificationResponse = new NotificationResponseVO({
        result: NotificationSendingResult.SUCCESS
      })

      const mailJetMessageEmitter = new MailjetMessageEmitter()

      // Act
      const result = await mailJetMessageEmitter.sendMails(mailInfos)

      // Assert
      expect(result.isOk).toBeTruthy()
      expect(result.unwrap()[0].result).toEqual(notificationResponse.result)
    })

    it('should send an email with multiple attachment', async () => {
      // Arrange
      const filesPaths = ["invoice1.pdf", "invoice2.docx"]

      for (const filePath of filesPaths) {
        fs.writeFileSync(filePath, filePath)
      }

      const zipFilePath: string = "invoices.zip"
      for (const filePath of filesPaths) {
        const gzip = createGzip()
        const readStream = fs.createReadStream(filePath)
        const writeStream = fs.createWriteStream(zipFilePath)
        await new Promise<void>((resolve, reject) => {
          readStream.pipe(gzip).pipe(writeStream)
          writeStream.on('finish', resolve)
          writeStream.on('error', reject)
        })
      }

      const notificationResponse = new NotificationResponseVO({
        result: NotificationSendingResult.SUCCESS
      })

      const mailJetMessageEmitter = new MailjetMessageEmitter()

      const mailInfos: MailNotificationInfo[] = [
        {
          to : {
            email: "cyprien@ekip.app",
          },
          textPart: "Hello Cyprien",
          filesPaths: [...filesPaths, zipFilePath]
        }
      ]

      // Act
      const result = await mailJetMessageEmitter.sendMails(mailInfos)

      // Assert
      expect(result.isOk).toBeTruthy()
      expect(result.unwrap()[0].result).toEqual(notificationResponse.result)

      //Cleanup
      for (const filePath of filesPaths) {
        fs.unlinkSync(filePath)
      }
    }) 
  })

  afterAll(async () => {
    await app.close()
  });


})