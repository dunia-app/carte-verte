import { AggregateRoot } from '../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { DateVO } from '../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { WebhookSource } from './webhook.types'

export interface CreateWebhookProps<EventType> {
  source: WebhookSource
  externalId: string
  externalCreatedAt: Date
  event: EventType
}

export interface WebhookProps<EventType> extends CreateWebhookProps<EventType> {
  handledAt?: DateVO
  handlerResponse?: boolean
}

export class WebhookEntity<EventType> extends AggregateRoot<
  WebhookProps<EventType>
> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateWebhookProps<any>): WebhookEntity<any> {
    const id = UUID.generate()
    const props: WebhookProps<any> = {
      ...create,
    }
    const webhook = new WebhookEntity({ id, props })

    return webhook
  }

  get event(): EventType {
    return this.props.event
  }

  get source(): WebhookSource {
    return this.props.source
  }

  public handleEvent(handlerResponse: boolean): boolean {
    if (this.props.handledAt) {
      return false
    }
    this.props.handledAt = new DateVO(new Date())
    this.props.handlerResponse = handlerResponse
    return true
  }

  public validate(): void {}
}
