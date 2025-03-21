import { CommandBus } from '@nestjs/cqrs';
import { Args, Int, ObjectType, Resolver } from '@nestjs/graphql';
import { CsvParser } from 'nest-csv-parser';
import { logger, pauseExec } from '../../../../helpers/application.helper';
import { ConfigService } from '../../../../infrastructure/config/config.service';
import { Result } from '../../../../libs/ddd/domain/utils/result.util';
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base';
import { AppMutation } from '../../../../libs/decorators/graphql.decorator';
import { NotFoundException } from '../../../../libs/exceptions/index';
import { UserRoles } from '../../../user/domain/entities/user.types';
import {
  InsertMerchantWithSiret,
  InsertMerchantWithSiretCommand,
} from './insert-merchant-with-siret.command';
import {
  InsertMerchantWithSiretFile,
  InsertMerchantWithSiretFileHeaders,
} from './insert-merchant-with-siret.request.dto';
const cryptoRandomString = require('crypto-random-string');
import fs = require('fs')

const batchSize = 5000
@ObjectType()
class InsertMerchantWithSiretResponse extends ErrorWithResponse(
  [NotFoundException],
  'InsertMerchantWithSiretErrorUnion',
  Int,
) {}

@Resolver()
export class InsertMerchantWithSiretGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly csvParser: CsvParser,
    readonly configService: ConfigService,
  ) {}

  @AppMutation(() => InsertMerchantWithSiretResponse, UserRoles.superAdmin)
  async insertMerchantWithSiret(
    @Args('fileName', { type: () => String }) fileName: String,
  ): Promise<InsertMerchantWithSiretResponse> {
    logger.info(`[${this.constructor.name}]: Task started`)
    const causationId = cryptoRandomString({ length: 8 })
    let saved = 0
    let total: number = 0
    let j = 0
    do {
      let merchantOrganizationFile
      try {
        merchantOrganizationFile = fs.createReadStream(
          `${this.configService.appRoot}/${fileName}`,
        )
      } catch (e: any) {
        logger.error(`[${this.constructor.name}] Error: ${e}`)
        return new InsertMerchantWithSiretResponse(
          Result.err(new NotFoundException(e)),
        )
      }
      const merchants = await this.csvParser.parse(
        merchantOrganizationFile,
        InsertMerchantWithSiretFile,
        batchSize,
        j,
        {
          strict: true,
          separator: ',',
          headers: InsertMerchantWithSiretFileHeaders,
          skipLines: 1,
        },
      )
      total === 0 ? (total = merchants.total) : null
      const command = new InsertMerchantWithSiretCommand({
        causationId: causationId,
        merchants: merchants.list.map(
          (organization) => new InsertMerchantWithSiret(organization),
        ),
      })

      const res = await this.commandBus.execute(command)

      res.isOk ? (saved += res.value) : saved
      j += batchSize
      await pauseExec()
    } while (total > j)
    logger.info(`[${this.constructor.name}]: Task finished`)
    return new InsertMerchantWithSiretResponse(Result.ok(saved))
  }
}
