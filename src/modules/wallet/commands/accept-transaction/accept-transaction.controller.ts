import {
  Body,
  Controller,
  Injectable,
  Post,
  Response,
  UseInterceptors,
} from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { FastifyReply } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { now } from '../../../../helpers/date.helper'
import { TimeoutLoggerInterceptor } from '../../../../infrastructure/interceptors/timeout-logger.interceptor'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { getTreezorDate } from '../../../../libs/ddd/infrastructure/baas/treezor.types'
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator'
import { CardRepository } from '../../../card/database/card/card.repository'
import { AdvantageRepository } from '../../../merchant/database/advantage/advantage.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { CardAcquisitionRepository } from '../../database/card-acquisition/card-acquisition.repository'
import { ExternalValidationRepository } from '../../database/external-validation/external-validation.repository'
import { WalletRepository } from '../../database/wallet/wallet.repository'
import { ExternalValidationResponseCode } from '../../domain/entities/external-validation.types'
import { AcceptTransactionCommand } from './accept-transaction.command'
import { ExternalValidationPayload } from './accept-transaction.request.dto'
import { ExternalValidationResponse } from './accept-transaction.response.dto'
import { acceptTransaction } from './accept-transaction.service'

@Controller('externalvalidation')
@Injectable()
@SkipJWTAuth()
@UseInterceptors(TimeoutLoggerInterceptor)
export class TransactionsExternalValidationController {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly cardRepo: CardRepository,
    private readonly externalValidationRepo: ExternalValidationRepository,
    private readonly advantageRepo: AdvantageRepository,
    private readonly cardAcquisitionRepo: CardAcquisitionRepository,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async transactionsExternalValidation(
    @Body() body: ExternalValidationPayload,
    @Response() resp: FastifyReply,
  ) {
    const time = now()
    logger.log(
      `[${this.constructor.name}]: start action on transactionsExternalValidation`,
    )
    logger.log(`[${this.constructor.name}]: body value ${JSON.stringify(body)}`)

    const responseId = UUID.generate()
    const command = new AcceptTransactionCommand({
      cardPublicToken: body.card_public_token,
      requestDate: new Date(body.request_date),
      paymentAmount: body.payment_amount.value,
      paymentDate: getTreezorDate(body.payment_local_time),
      merchantId: body.merchant_data.id,
      merchantName: body.merchant_data.name,
      merchantCity: body.merchant_data.city,
      merchantCountry: body.merchant_data.country_code,
      mcc: body.merchant_data.mcc,
      authorizationIssuerId: body.authorization_issuer_id,
      time: time,
    })

    const res = await acceptTransaction(
      command,
      this.walletRepo,
      this.employeeRepo,
      this.cardRepo,
      this.externalValidationRepo,
      this.advantageRepo,
      this.cardAcquisitionRepo,
      this.queryBus,
    )

    return resp.status(200).send(
      new ExternalValidationResponse({
        responseDate: new Date(),
        responseId: responseId,
        responseCode: res.isErr
          ? ExternalValidationResponseCode.DECLINED
          : res.value,
      }),
    )
  }
}
