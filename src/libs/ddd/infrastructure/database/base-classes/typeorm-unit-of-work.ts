import {
  DataSource,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository,
} from 'typeorm'
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel'
import { Logger } from '../../../domain/ports/logger.port'
import { UnitOfWorkPort } from '../../../domain/ports/unit-of-work.port'
import { Result } from '../../../domain/utils/result.util'

/**
 * Keep in mind that this is a naive implementation
 * of a Unit of Work as it only wraps execution into
 * a transaction. Proper Unit of Work implementation
 * requires storing all changes in memory first and
 * then execute a transaction as a singe database call.
 * Mikro-orm (https://www.npmjs.com/package/mikro-orm)
 * is a nice ORM for nodejs that can be used instead
 * of typeorm to have a proper Unit of Work pattern.
 * Read more about mikro-orm unit of work:
 * https://mikro-orm.io/docs/unit-of-work/.
 */
export class TypeormUnitOfWork implements UnitOfWorkPort {
  constructor(
    private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  private queryRunners: Map<string, QueryRunner> = new Map()

  getQueryRunner(correlationId: string): QueryRunner {
    const queryRunner = this.queryRunners.get(correlationId)
    if (!queryRunner) {
      throw new Error(
        'Query runner not found. Incorrect correlationId or transaction is not started. To start a transaction wrap operations in a "execute" method.',
      )
    }
    return queryRunner
  }

  getOrmRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
    correlationId: string,
  ): Repository<Entity> {
    const queryRunner = this.getQueryRunner(correlationId)
    return queryRunner.manager.getRepository(entity)
  }

  /**
   * Execute a UnitOfWork.
   * Database operations wrapped in a `execute` method will run
   * in a single transactional operation, so everything gets
   * saved (including changes done by Domain Events) or nothing at all.
   */
  async execute<T>(
    correlationId: string,
    callback: () => Promise<T>,
    options?: { isolationLevel: IsolationLevel; logTransaction: boolean },
  ): Promise<T> {
    if (!correlationId) {
      throw new Error('Correlation ID must be provided')
    }
    const queryRunner = this.dataSource.createQueryRunner()
    this.queryRunners.set(correlationId, queryRunner)
    if (options && options.logTransaction) {
      this.logger.debug(`[Starting transaction]:[${this.constructor.name}]`)
    }
    await queryRunner.connect()
    await queryRunner.startTransaction(options?.isolationLevel)
    // const queryRunner = this.getQueryRunner(correlationId);
    let result: T | Result<T>
    try {
      result = await callback()
      // if ((result as unknown as Result<T>)?.isErr) {
      //   await this.rollbackTransaction<T>(
      //     correlationId,
      //     (result as unknown as Result.Err<T, Error>).error,
      //   )
      //   return result
      // }
    } catch (error) {
      await this.rollbackTransaction<T>(correlationId, error as Error)
      throw error
    }
    try {
      await queryRunner.commitTransaction()
    } finally {
      await this.finish(correlationId)
    }

    if (options && options.logTransaction) {
      this.logger.debug(`[Transaction committed]:[${this.constructor.name}]`)
    }

    return result
  }

  private async rollbackTransaction<T>(correlationId: string, error: Error) {
    const queryRunner = this.getQueryRunner(correlationId)
    try {
      await queryRunner.rollbackTransaction()
      this.logger.debug(
        `[Transaction rolled back]:[${this.constructor.name}] ${
          (error as Error).message
        }`,
      )
    } finally {
      await this.finish(correlationId)
    }
  }

  private async finish(correlationId: string): Promise<void> {
    const queryRunner = this.getQueryRunner(correlationId)
    try {
      await queryRunner.release()
    } finally {
      this.queryRunners.delete(correlationId)
    }
  }
}
