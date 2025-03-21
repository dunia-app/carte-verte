import { ArgumentNotProvidedException } from '../../../exceptions/index'
import { Guard } from '../guard'
import { UUID } from '../value-objects/uuid.value-object'

export type DomainEventProps<T> = Omit<
  T,
  'id' | 'correlationId' | 'dateOccurred' | 'persistEvent'
> &
  Omit<
    DomainEvent,
    'id' | 'correlationId' | 'dateOccurred' | 'persistEvent'
  > & {
    correlationId?: string
    dateOccurred?: number
    persistEvent?: boolean
  }

export abstract class DomainEvent {
  public readonly id: string

  /** Aggregate ID where domain event occurred */
  public readonly aggregateId: string

  /** Date when this domain event occurred */
  public readonly dateOccurred: number

  /** ID for correlation purposes (for UnitOfWork, Integration Events,logs correlation etc).
   * This ID is set automatically in a publisher.
   */
  public correlationId?: string

  /**
   * Do we want to persist this event if it occurs
   */
  abstract persistEvent: boolean

  /**
   * Causation id to reconstruct execution ordering if needed
   */
  public causationId?: string

  constructor(props: DomainEventProps<unknown>) {
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'DomainEvent props should not be empty',
      )
    }
    this.id = UUID.generate().unpack()
    this.aggregateId = props.aggregateId
    this.dateOccurred = props.dateOccurred ?? Date.now()
    if (props.correlationId) this.correlationId = props.correlationId
  }
}
