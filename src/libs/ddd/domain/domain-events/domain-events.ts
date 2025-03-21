/* eslint-disable no-param-reassign */
import { Repository } from 'typeorm'
import { objectArrayToObjectArrayKey } from '../../../../helpers/object.helper'
import { newConnection } from '../../../../infrastructure/database/create_connection'
import { final } from '../../../decorators/final.decorator'
import { TWithStringKeys } from '../../../types/t-with-keys'
import { isUndefined } from '../../../utils/is-undefined.util'
import { AggregateRoot } from '../base-classes/aggregate-root.base'
import { Logger } from '../ports/logger.port'
import { UUID } from '../value-objects/uuid.value-object'
import { EventOrmEntity } from './entities/event.orm-entity'
import { DomainEvent, DomainEventHandler } from './index'

type EventName = string

export type DomainEventClass = new (...args: never[]) => DomainEvent

@final
export class DomainEvents {
  private static subscribers: Map<EventName, DomainEventHandler[]> = new Map()

  private static aggregates: AggregateRoot<unknown>[] = []

  private static eventRepository: Repository<EventOrmEntity>

  private static async getEventRepository() {
    if (!this.eventRepository) {
      this.eventRepository = (await newConnection())
        .createQueryRunner()
        .manager.getRepository(EventOrmEntity)
    }
    return this.eventRepository
  }

  public static subscribe<T extends DomainEventHandler>(
    event: DomainEventClass,
    eventHandler: T,
  ): void {
    const eventName: EventName = event.name
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, [])
    }
    this.subscribers.get(eventName)?.push(eventHandler)
  }

  public static prepareForPublish(aggregate: AggregateRoot<unknown>): void {
    const aggregateFound = !!this.findAggregateByID(aggregate.id)
    if (!aggregateFound) {
      this.aggregates.push(aggregate)
    }
  }

  public static async publishEvents(
    id: UUID,
    logger: Logger,
    correlationId?: string,
  ): Promise<void> {
    const aggregate = this.findAggregateByID(id)

    if (aggregate) {
      logger.debug(
        `[${aggregate.domainEvents.map(
          (event) => event.constructor.name,
        )}] published ${aggregate.id.value}`,
      )
      await Promise.all(
        aggregate.domainEvents.map(async (event: DomainEvent) => {
          if (correlationId && !event.correlationId) {
            event.correlationId = correlationId
          }
          if (event.persistEvent) {
            await this.persistEvent(event)
            logger.debug(
              `[${event.constructor.name}] persisted ${aggregate.id.value}`,
            )
          }
          return this.publish(event, logger)
        }),
      )
      aggregate.clearEvents()
      this.removeAggregateFromPublishList(aggregate)
    }
  }

  public static async publishMultipleEvents(
    ids: UUID[],
    logger: Logger,
    correlationId?: string,
  ) {
    const aggregates = ids
      .map((id) => this.findAggregateByID(id))
      .filter(
        (aggregate): aggregate is AggregateRoot<unknown> =>
          !isUndefined(aggregate),
      )

    if (aggregates.length != 0) {
      const domainEventsByType = objectArrayToObjectArrayKey(
        aggregates.map((aggregate) => aggregate.domainEvents).flat(),
        undefined,
        (domainEvent) => domainEvent.constructor.name,
      )
      await Promise.all(
        Object.entries(domainEventsByType).map(
          async ([eventName, domainEvents]) => {
            logger.debug(
              `[${eventName}] published ${domainEvents.map(
                (domainEvent) => domainEvent.aggregateId,
              )}`,
            )
            if (correlationId) {
              domainEvents.map(
                (domainEvent) => (domainEvent.correlationId = correlationId),
              )
            }

            if (domainEvents[0].persistEvent) {
              await this.persistEvents(domainEvents)
              logger.debug(
                `[${eventName}] persisted ${domainEvents.map(
                  (domainEvent) => domainEvent.aggregateId,
                )}`,
              )
            }
            return this.publishMultiple(domainEvents, logger)
          },
        ),
      )
      aggregates.map((aggregate) => {
        aggregate.clearEvents()
        this.removeAggregateFromPublishList(aggregate)
      })
    }
  }

  private static findAggregateByID(
    id: UUID,
  ): AggregateRoot<unknown> | undefined {
    for (const aggregate of this.aggregates) {
      if (aggregate.id.equals(id)) {
        return aggregate
      }
    }
  }

  private static async persistEvent(
    event: DomainEvent,
  ): Promise<EventOrmEntity> {
    const { persistEvent, ...rest } = event
    const eventToPersist: EventOrmEntity = new EventOrmEntity({
      eventName: event.constructor.name,
      variables: {
        ...rest,
      } as TWithStringKeys,
    })
    const eventSaved = await (
      await this.getEventRepository()
    ).save(eventToPersist)

    return eventSaved
  }

  private static async persistEvents(
    events: DomainEvent[],
  ): Promise<EventOrmEntity[]> {
    const eventToPersist: EventOrmEntity[] = events.map((event) => {
      const { persistEvent, ...rest } = event
      return new EventOrmEntity({
        eventName: event.constructor.name,
        variables: {
          ...rest,
        } as TWithStringKeys,
      })
    })
    const eventSaved = await (
      await this.getEventRepository()
    ).save(eventToPersist)

    return eventSaved
  }

  private static removeAggregateFromPublishList(
    aggregate: AggregateRoot<unknown>,
  ): void {
    const index = this.aggregates.findIndex((a) => a.equals(aggregate))
    this.aggregates.splice(index, 1)
  }

  private static async publish(
    event: DomainEvent,
    logger: Logger,
  ): Promise<void> {
    const eventName: string = event.constructor.name

    if (this.subscribers.has(eventName)) {
      const handlers: DomainEventHandler[] =
        this.subscribers.get(eventName) || []
      await Promise.all(
        handlers.map((handler) => {
          logger.debug(
            `[${handler.constructor.name}] handling ${event.constructor.name} ${event.aggregateId}`,
          )
          return handler.handle([event])
        }),
      )
    }
  }

  private static async publishMultiple(
    events: DomainEvent[],
    logger: Logger,
  ): Promise<void> {
    const eventName: string = events[0].constructor.name

    if (this.subscribers.has(eventName)) {
      const handlers: DomainEventHandler[] =
        this.subscribers.get(eventName) || []
      await Promise.all(
        handlers.map((handler) => {
          logger.debug(
            `[${handler.constructor.name}] handling ${eventName} ${events.map(
              (domainEvent) => domainEvent.aggregateId,
            )}`,
          )
          return handler.handle(events)
        }),
      )
    }
  }
}
