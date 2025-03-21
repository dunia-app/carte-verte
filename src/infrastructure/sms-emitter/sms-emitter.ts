import { Injectable } from '@nestjs/common'
import { OctopushSmsEmitter } from '../../libs/ddd/infrastructure/sms-emitter/octopush.sms-emitter.base'

@Injectable()
export class SmsEmitter extends OctopushSmsEmitter {}
