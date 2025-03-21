import { Column, Entity, OneToMany, Unique } from 'typeorm'
import { OrmEntityProps } from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { MessageOrmEntity } from '../message/message.orm-entity'
import { TemplateOrmEntity } from '../template/template.orm-entity'

@Entity('message_template_name_enum')
@Unique('UQ_message_template_name_enum', ['value'])
export class MessageTemplateNameEnumOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<MessageTemplateNameEnumOrmEntity>) {
    super(props)
  }
  @Column('varchar')
  value!: string

  @OneToMany(() => MessageOrmEntity, (message) => message.templateName)
  private _messages!: MessageOrmEntity[]

  @OneToMany(() => TemplateOrmEntity, (template) => template.templateName)
  private _templates!: TemplateOrmEntity[]
}
