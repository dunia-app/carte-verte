import { Controller, Injectable, Post, Response, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { FastifyReply } from 'fastify';
import { logger } from "../../../../helpers/application.helper";
import { getCacheTime } from "../../../../helpers/cache.helper";
import { OidcGuard } from "../../../../infrastructure/guards/oicd.guard";
import { RedisService } from "../../../../infrastructure/redis/redis.service";
import { CommandProps } from "../../../../libs/ddd/domain/base-classes/command.base";
import { SkipJWTAuth } from "../../../../libs/decorators/auth.decorator";
import { SendEmployeeNoTransactionReminderCommand } from "./send-employee-no-transaction-reminder.command";
const cryptoRandomString = require('crypto-random-string');
;
import Redlock = require('redlock');

//used for deployment
const schedule = '0 0 * * *' ;
//must exactly match file name
const route = 'send-employee-no-transaction-reminder';
const prodOnly = false ;

@Controller(route)
@Injectable()
@SkipJWTAuth()
export class SendEmployeeNoTransactionReminderController {
    constructor(
        private readonly commandBus: CommandBus,
        readonly redis: RedisService,
    ) {}

    @UseGuards(new OidcGuard(route))
    @Post()
    async SendEmployeeNoTransactionReminder(@Response() res: FastifyReply): Promise<void> {
        logger.info(`Start task ${route} controller...`);
        let redlock: Redlock.Lock | undefined ;

        try {
            redlock = await this.redis.redlock.lock(
                `lock:[${this.constructor.name}]:${route}`,
                getCacheTime(9.5, true),
            )

            const input: CommandProps<SendEmployeeNoTransactionReminderCommand> = {
                correlationId: cryptoRandomString({ length: 8 }),
            };
    
            const command = new SendEmployeeNoTransactionReminderCommand(input);

            const commandResult = await this.commandBus.execute(command);

            if (commandResult.isErr) {
                logger.error(`Task ${route} failed: ${commandResult.unwrap()}`)
                res.status(400).send(commandResult.unwrap());
                return;
            }

            logger.info(`Task ${route} completed successfully`)
            res.status(200).send(commandResult.unwrap());
        } catch (error) {
            logger.error(`Task ${route} failed: ${error}`)
            res.status(500).send(error);
        } finally {
            if (redlock) {
              await this.redis.redlock.unlock(redlock)
            }
          }
    }
}