import { Global, Module } from '@nestjs/common'
import { FindPlaceResolver } from './find-place/find-place.resolver'
import { FindPlaceService } from './find-place/find-place.service'

@Global()
@Module({
  providers: [FindPlaceService, FindPlaceResolver],
  exports: [FindPlaceService],
})
export class PlaceAutocompleteModule {}
