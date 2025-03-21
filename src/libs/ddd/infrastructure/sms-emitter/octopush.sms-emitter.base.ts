import { UnprocessableEntityException } from '@nestjs/common'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { firstValueFrom, from } from 'rxjs'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { TWithStringKeys } from '../../../types/t-with-keys'
import { Logger } from '../../domain/ports/logger.port'
import { SmsEmitterPort } from '../../domain/ports/sms-emitter.port'

export class OctopushSmsEmitter implements SmsEmitterPort {
  private retryConfig = {
    retry: 3,
    retryDelay: 3000,
  } as AxiosRequestConfig<any>
  private axiosInstance! : AxiosInstance
  private readonly config: ConfigService
  private readonly logger: Logger
  constructor() {
    this.config = new ConfigService()
    this.logger = logger
    this.getClient()
  }

  private getClient() {
    const login = this.config.getStr('OCTOPUSH_LOGIN')
    const key = this.config.getStr('OCTOPUSH_KEY')
    const headers: TWithStringKeys = {
      'api-login': login,
      'api-key': key,
    }
    this.axiosInstance = axios.create({
      baseURL: this.config.getStr('OCTOPUSH_URL'),
      timeout: 10000,
      headers,
    })
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const data = error?.response?.data
        let { config, message } = error
        const msg = data ? JSON.stringify(data, null, 2) : message
        // retry while Network timeout or Network Error
        if (
          !config ||
          !config.retry ||
          !(message.includes('timeout') || message.includes('Network Error'))
        ) {
          this.logger.error(
            msg,
            null,
            `[${this.constructor.name}]: Octopush Api Error for path ${error.request.path}`,
          )
          throw new UnprocessableEntityException(`Octopush Error: ${msg}`)
        }
        config.retry -= 1
        const delayRetryRequest = new Promise<void>((resolve) => {
          setTimeout(() => {
            this.logger.log(
              `[${this.constructor.name}]: retry the request url: ${config.url}`,
            )
            resolve()
          }, config.retryDelay || 1000)
        })
        return delayRetryRequest.then(() => axios(config))
      },
    )
  }

  async sendSMS(tel: string, content: string): Promise<boolean> {
    const res = await firstValueFrom(
      from(this.axiosInstance.post(
        '/sms-campaign/send',
        {
          recipients: [
            {
              phone_number: tel,
            },
          ],
          text: content,
          type: 'sms_low_cost',
          purpose: 'alert',
          sender: 'Ekip',
          with_replies: false,
          auto_optimize_text: false,
        },
        this.retryConfig,
      )),
    )
    if (res.data.sms_ticket) {
      return true
    }
    return false
  }
}