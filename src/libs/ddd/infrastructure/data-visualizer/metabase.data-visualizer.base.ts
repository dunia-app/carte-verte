import { Result } from '@badrap/result'
import jwt from 'jsonwebtoken'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  DashboardName,
  DataVisualizerError,
  DataVisualizerPort,
} from '../../domain/ports/data-visualizer.port'

export class MetabaseDataVisualizer implements DataVisualizerPort {
  private readonly config: ConfigService
  private secretKey: string
  private baseUrl = 'http://metabase.ekip.app'
  constructor() {
    this.config = new ConfigService()
    this.secretKey = this.config.getStr('METABASE_SECRET_KEY')
    this.baseUrl = this.config.getStr('METABASE_URL')
  }

  private getDashboardIdFromName(dashboardName: DashboardName) {
    switch (dashboardName) {
      case DashboardName.ORGANIZATION_OVERVIEW:
        return 9
      case DashboardName.ORGANIZATION_IMPACT_OVERVIEW:
        return 12
      default:
        return undefined
    }
  }

  async getEmbeddedDashboardUrl(
    dashboardName: DashboardName,
    params: { [key: string]: string },
  ): Promise<Result<string, DataVisualizerError>> {
    var payload = {
      resource: { dashboard: this.getDashboardIdFromName(dashboardName) },
      params: params,
      exp: Math.round(Date.now() / 1000) + 20 * 60, // 20 minute expiration
    }
    var token = jwt.sign(payload, this.secretKey)

    return Result.ok(
      `${this.baseUrl}/embed/dashboard/${token}#bordered=true&titled=false`,
    )
  }
}
