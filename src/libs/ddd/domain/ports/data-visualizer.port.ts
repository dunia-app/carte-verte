import { registerEnumType } from '@nestjs/graphql'
import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../utils/result.util'

export enum DashboardName {
  ORGANIZATION_OVERVIEW = 'ORGANIZATION_OVERVIEW',
  ORGANIZATION_IMPACT_OVERVIEW = 'ORGANIZATION_IMPACT_OVERVIEW',
}
export const dashboardNameEnumName = 'dashboard_name_enum'
registerEnumType(DashboardName, { name: dashboardNameEnumName })

export interface DataVisualizerPort {
  getEmbeddedDashboardUrl(
    dashboardName: DashboardName,
    params: { [key: string]: string },
  ): Promise<Result<string, DataVisualizerError>>
}

export class DataVisualizerError extends ExceptionBase {
  static readonly message = 'Unable to visualize data'

  public readonly code: string = 'DATA_VISUALIZER.ERROR'

  constructor(metadata?: unknown) {
    super(DataVisualizerError.message, metadata)
  }
}
