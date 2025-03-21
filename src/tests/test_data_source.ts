import { newConnection } from '../infrastructure/database/create_connection'
export const testDataSource = newConnection({ logging: false })