import { RepositoryPort } from '../../../libs/ddd/domain/ports/repository.ports'
import { WebhookEntity, WebhookProps } from '../entity/webhook.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface WebhookRepositoryPort
  extends RepositoryPort<WebhookEntity<any>, WebhookProps<any>> {
  findOneByExternalIdOrThrow(
    externalId: string,
    source: string,
  ): Promise<WebhookEntity<any>>
  exists(externalId: string, source: string): Promise<boolean>
  findManyToHandle(
    batchSize: number,
    source?: string,
  ): Promise<WebhookEntity<any>[]>
  findManyToHandleCount(source?: string): Promise<number>
}
