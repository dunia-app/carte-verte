import { ErrorTypeOrmEntity } from '../../../libs/exceptions/entities/error-type.orm-entity'
import { newConnection } from '../create_connection'
import { errorTypes } from './error-type'

export async function errorTypesFixtures() {
  const connection = await newConnection({ logging: false })
  const repo = connection.getRepository(ErrorTypeOrmEntity)
  const errorTypeEntities = errorTypes.map(
    (errorType) => new ErrorTypeOrmEntity(errorType),
  )

  const existingErrorTypes = await repo.find()
  const errorTypeToSave = errorTypeEntities.filter(
    (errorType) =>
      !existingErrorTypes.find(
        (existingErrorType) =>
          existingErrorType.code === errorType.code &&
          existingErrorType.language === errorType.language,
      ),
  )

  if (errorTypeToSave.length) {
    console.log('errorTypes fixtures pushing')
    console.time(`saving ${errorTypeToSave.length} errorTypes`)
    await repo.save(errorTypeToSave)
    console.timeEnd(`saving ${errorTypeToSave.length} errorTypes`)
  }
  connection.destroy()
}
