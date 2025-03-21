import { Injectable } from '@nestjs/common'
import { MailjetMessageEmitter } from '../../libs/ddd/infrastructure/message-emitter/mailjet.message-emitter.base'

@Injectable()
export class MessageEmitter extends MailjetMessageEmitter {}
