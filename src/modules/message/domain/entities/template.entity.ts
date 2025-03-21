import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { NotificationType } from './notification.types'
import { MessageTemplateName } from './template.types'

export interface CreateTemplateProps {
  templateName: MessageTemplateName
  allowedNotificationType: NotificationType[]
  title?: string
  content: string
  iconUrl?: string
  link?: string
  unsubscribable: boolean
}

export interface TemplateProps extends CreateTemplateProps {}

export class TemplateEntity extends AggregateRoot<TemplateProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateTemplateProps): TemplateEntity {
    const id = UUID.generate()
    const props: TemplateProps = {
      ...create,
    }
    const template = new TemplateEntity({ id, props })
    return template
  }

  get templateName(): MessageTemplateName {
    return this.props.templateName
  }

  get title(): string | undefined {
    return this.props.title
  }

  get content(): string {
    return this.props.content
  }

  get link(): string | undefined {
    return this.props.link
  }

  get unsubscribable(): boolean {
    return this.props.unsubscribable
  }

  acceptNotificationType(type: NotificationType) {
    return this.props.allowedNotificationType.includes(type)
  }

  public validate(): void {}
}
