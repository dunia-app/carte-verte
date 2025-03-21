import { Injectable } from '@nestjs/common'
import { MetabaseDataVisualizer } from '../../libs/ddd/infrastructure/data-visualizer/metabase.data-visualizer.base'

@Injectable()
export class DataVisualizer extends MetabaseDataVisualizer {}
