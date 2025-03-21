import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { logger } from '../../../helpers/application.helper'
import { CacheTimes } from '../../../helpers/cache.helper'

import { Result } from '../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../libs/ddd/domain/value-objects/address.value-object'
import { RedisService } from '../../redis/redis.service'
import { PlaceNotFoundError } from './find-place.errors'
import { ApiAdresseResponse } from './find-place.response.dto'

const ADDRESS_API_URI = 'https://api-adresse.data.gouv.fr'
const SEARCH_ENDPOINT = '/search'
const REVERSE_ENDPOINT = '/reverse'
const LIMIT = 5

@Injectable()
export class FindPlaceService {
  constructor(private readonly redis: RedisService) {}

  async findPlaceCoords(
    place: string,
  ): Promise<Result<ApiAdresseResponse[], PlaceNotFoundError>> {
    return this.findPlace(
      `${ADDRESS_API_URI}${SEARCH_ENDPOINT}/?q=${encodeURI(
        place,
      )}&limit=${LIMIT}`,
    )
  }

  async findAddressCoords(
    address: Address,
  ): Promise<Result<ApiAdresseResponse[], PlaceNotFoundError>> {
    return this.findPlaceCoords(address.formattedAddress)
  }

  async findCoordsAddress(
    latitude: number,
    longitude: number,
  ): Promise<Result<ApiAdresseResponse[], PlaceNotFoundError>> {
    return this.findPlace(
      `${ADDRESS_API_URI}${REVERSE_ENDPOINT}/?lat=${encodeURI(
        latitude.toString(),
      )}&lon=${encodeURI(longitude.toString())}&limit=${LIMIT}`,
    )
  }

  private async findPlace(
    endpointUrl: string,
  ): Promise<Result<ApiAdresseResponse[], PlaceNotFoundError>> {
    const localizationArray: ApiAdresseResponse[] = []

    const redisKey = `findPlace:${endpointUrl}`
    const res: ApiAdresseResponse[] = await this.redis.get(redisKey)
    if (res) {
      return Result.ok(res)
    } else {
      try {
        const response = await axios.get(endpointUrl).catch((e) => {
          logger.error(
            `[${this.constructor.name}]: Error with findPlace API : ${e}`,
          )
          return undefined
        })

        if (!response || response.data.features.length === 0) {
          return Result.err(new PlaceNotFoundError())
        }
        response.data.features.forEach((localization: any) => {
          const localizationObj: ApiAdresseResponse = {
            label: localization.properties.label,
            street: localization.properties.name,
            postalCode: localization.properties.postcode,
            country: 'France',
            city: localization.properties.city,
            longitude: localization.geometry.coordinates[0],
            latitude: localization.geometry.coordinates[1],
          }
          localizationArray.push(localizationObj)
        })
        await this.redis.set(redisKey, localizationArray, CacheTimes.OneWeek)
        return Result.ok(localizationArray)
      } catch (e) {
        logger.error(`[${this.constructor.name}]: findPlace: ${e}`)
        throw e
      }
    }
  }
}
