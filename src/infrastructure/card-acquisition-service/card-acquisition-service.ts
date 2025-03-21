import { Injectable } from '@nestjs/common'
import { HipayCardAcquisitionService } from '../../libs/ddd/infrastructure/card-acquisition-service/hipay.card-acquisition-service.base'

@Injectable()
export class CardAcquisitionService extends HipayCardAcquisitionService {}
