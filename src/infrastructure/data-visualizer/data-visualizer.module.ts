import { Global, Module } from '@nestjs/common'
import { DataVisualizer } from './data-visualizer'
import { EmbeddedDashboardUrlResolver } from './embedded-dashboard-url/embedded-dashboard-url.resolver'

@Global()
@Module({
  imports: [],
  providers: [DataVisualizer, EmbeddedDashboardUrlResolver],
  exports: [DataVisualizer],
})
export class DataVisualizerModule {}
