import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Repository } from 'typeorm'
import { getRequest } from '../../helpers/application.helper'
import { CacheTimes } from '../../helpers/cache.helper'
import { Language } from '../../helpers/language.helper'
import { ErrorTypeOrmEntity } from '../../libs/exceptions/entities/error-type.orm-entity'
import { newConnection } from '../database/create_connection'
import { RedisService } from '../redis/redis.service'

const defaultLanguage = Language.FR
const defaultTitle = 'Erreur technique'
const defaultMessage =
  'Aie, nous rencontrons actuellement des difficultés à exécuter cette action. Nous enregistrons ce bug pour le corriger au plus vite.'

@Injectable()
export class TranslateErrorMessageInterceptor implements NestInterceptor {
  private _errorTypeRepo?: Repository<ErrorTypeOrmEntity>

  constructor(private readonly redis: RedisService) {}

  private async getErrorTypeRepository() {
    if (!this._errorTypeRepo) {
      this._errorTypeRepo = (await newConnection())
        .createQueryRunner()
        .manager.getRepository(ErrorTypeOrmEntity)
    }
    return this._errorTypeRepo
  }

  private async getErrorTypeForLanguage(
    language?: Language,
  ): Promise<ErrorTypeOrmEntity[]> {
    const languageUsed = language ?? defaultLanguage
    return this.redis.fetch(
      `errorType:${languageUsed}`,
      CacheTimes.OneDay,
      async () => {
        return (await this.getErrorTypeRepository()).find({
          where: {
            language: languageUsed,
          },
        })
      },
    )
  }

  private async checkAndModifyErrorField(
    obj: any,
    language?: Language,
  ): Promise<boolean> {
    let found = false

    for (const prop in obj) {
      if (prop === 'error') {
        if (obj[prop].code) {
          obj[prop].traduction = this.getTraduction(obj[prop], language)
        }
        if (obj[prop].child?.length > 0) {
          for (const child of obj[prop].child) {
            if (child.code) {
              child.traduction = this.getTraduction(child, language)
            }
          }
        }
      } else if (typeof obj[prop] === 'object') {
        found = await this.checkAndModifyErrorField(obj[prop], language)
      }
    }
    return found
  }

  private async getTraduction(obj: any, language?: Language): Promise<any> {
    const messageTraduction = (
      await this.getErrorTypeForLanguage(language)
    ).find((errorType) => errorType.code === obj.code)
    return {
      title: messageTraduction
        ? messageTraduction.translatedTitle
        : defaultTitle,
      message: messageTraduction
        ? messageTraduction.translatedMessage
        : defaultMessage,
    }
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const language = Object.values(Language).find(
      (lang) =>
        lang ===
        (
          getRequest(context).headers['accept-language'] as string
        )?.toUpperCase(),
    )
    return next.handle().pipe(
      map(async (data) => {
        await this.checkAndModifyErrorField(data, language)
        return data
      }),
    )
  }
}
