import { Result } from '@badrap/result';
import {
  Controller,
  Injectable,
  Post,
  Response,
  UseGuards
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FastifyReply } from 'fastify';
import { from, lastValueFrom, mergeMap, take, tap, timer } from 'rxjs';
import { logger } from '../../../../helpers/application.helper';
import { getCacheTime } from '../../../../helpers/cache.helper';
import { OidcGuard } from '../../../../infrastructure/guards/oicd.guard';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { CommandProps } from '../../../../libs/ddd/domain/base-classes/command.base';
import { SkipJWTAuth } from '../../../../libs/decorators/auth.decorator';
import { ExceptionBase } from '../../../../libs/exceptions/exception.base';
import { NotificationRepository } from '../../database/notification/notification.repository';
import { SendNotificationsCommand } from './send-notifications.command';
const cryptoRandomString = require('crypto-random-string');
import moment = require('moment')
import Redlock = require('redlock')

//used for deployment
const schedule = '* * * * *' ;
//must exactly match file name
const route = 'send-notifications' ;
const prodOnly = false ;


@Controller(route)
@Injectable()
@SkipJWTAuth()
export class SendNotificationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly notificationRepo: NotificationRepository,
    readonly redis: RedisService,
  ) {}

  async sendNotificationsProcess(lockName: string, redlock: Redlock.Lock | undefined, id: number) : Promise<Redlock.Lock | undefined> {
    try{
      logger.info(`Id : ${id}. Redlock expiration value before acquisition : ${redlock?.expiration}`)
      redlock = await this.redis.redlock.lock(
        lockName,
        getCacheTime(9.5, true),
      )
      logger.info(`Id : ${id}. The lock is acquired : ${lockName}`);
      logger.info(`Id : ${id}. Redlock expiration value after acquisition : ${redlock?.expiration}`)

      await this.handleNotificationsCommands();
      logger.info(`Id : ${id}. Finished process to handle webhooks`);
    }catch (error: any) {
      //If one handle webhook failes (for example, because of a timeout), we want to continue with the next one
      logger.error(`Id : ${id}. Error in ${route} controller ${error}`);
    } finally {
        if (redlock && redlock.expiration != 0) {
          await this.redis.redlock.unlock(redlock);
          logger.info(`Id : ${id}. The lock is unlocked : ${lockName}`);
          logger.info(`Id : ${id}. Redlock expiration value after release : ${redlock?.expiration}`);
        }else if(redlock?.expiration == 0){
          logger.info(`Id : ${id}. The lock has already been unlocked`);
        }
        else{
          logger.info(`Id : ${id}. The lock is not acquired : ${lockName}`);
        }
        return redlock ;
    }
  }

  @UseGuards(new OidcGuard(route))
  @Post()
  async SendNotifications(@Response() res: FastifyReply): Promise<void> {
    logger.info(`Start task ${route} controller...`)
    let redlock: Redlock.Lock | undefined ;

    const lockName = `lock:[${this.constructor.name}]:${route}`;
    let nbIteration = 0 ;

    try {
      await lastValueFrom(
        timer(0, 10000).pipe(
          take(6),
          mergeMap(() => from(this.sendNotificationsProcess(lockName, redlock, nbIteration))),
          tap((newLock) => {
            redlock = newLock;
            nbIteration++ ;
          }),
        )
      );

      logger.info(`Ending ${route} controller`);
      res.status(200).send(Result.ok(0)) ;
    } catch (error) {
      logger.error(`Task ${route} failed: ${error}`)
      res.status(500).send(error)
    } 
  }

  private async handleNotificationsCommands(): Promise<
    Result<null, ExceptionBase> | undefined
  > {
    const lessThanDate = moment().add(5, 'seconds').toDate()
    const total = await this.notificationRepo.messagesToBeSentCount(
      lessThanDate,
    )
    if (total === 0) return
    const input: CommandProps<SendNotificationsCommand> = {
      correlationId: cryptoRandomString({ length: 8 }),
      total: total,
      lessThanDate: lessThanDate,
    }
    const command = new SendNotificationsCommand(input)

    const commandResult: Result<null, ExceptionBase> =
      await this.commandBus.execute(command)
    return commandResult
  }
}
