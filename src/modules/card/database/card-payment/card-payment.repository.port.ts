import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  CardPaymentEntity,
  CardPaymentProps,
} from '../../domain/entities/card-payment.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface CardPaymentRepositoryPort
  extends RepositoryPort<CardPaymentEntity, CardPaymentProps> {
  findOneByExternalPaymentIdOrThrow(
    externalPayment: string,
  ): Promise<CardPaymentEntity>
  findOneByCardIdOrThrow(cardId: string): Promise<CardPaymentEntity>
  exists(cardId: string): Promise<boolean>
}
