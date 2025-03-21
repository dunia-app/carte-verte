import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import { MessageTemplateName } from '../entities/template.types'

// DomainEvent is a plain object with properties
export class MessageCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(props: DomainEventProps<MessageCreatedDomainEvent>) {
    super(props)
    this.receiverId = props.receiverId
    this.messageTemplateName = props.messageTemplateName
  }

  readonly receiverId: string

  readonly messageTemplateName: MessageTemplateName
}
