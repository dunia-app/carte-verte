import { MessageTemplateNameEnumOrmEntity } from '../../../modules/message/database/message-template-name-enum/message-template-name-enum.orm-entity'
import { MessageTemplateName } from '../../../modules/message/domain/entities/template.types'
import { newConnection } from '../create_connection'

export async function messageTemplateNameEnumsFixtures() {
  const connection = await newConnection({ logging: false })
  const repo = connection.getRepository(MessageTemplateNameEnumOrmEntity)
  const messageTemplateNames = Object.values(MessageTemplateName)
  const messageTemplateNameEnumEntities = messageTemplateNames.map(
    (messageTemplateName) =>
      new MessageTemplateNameEnumOrmEntity({ value: messageTemplateName }),
  )

  const existingMessageTemplateNames = await repo.find()
  const messageTemplateNameEnumToSave = messageTemplateNameEnumEntities.filter(
    (messageTemplateNameEnum) =>
      !existingMessageTemplateNames.find(
        (existingErrorType) =>
          existingErrorType.value === messageTemplateNameEnum.value,
      ),
  )

  if (messageTemplateNameEnumToSave.length) {
    console.log('messageTemplateNameEnums fixtures pushing')
    console.time(
      `saving ${messageTemplateNameEnumToSave.length} messageTemplateNameEnums`,
    )
    await repo.save(messageTemplateNameEnumToSave)
    console.timeEnd(
      `saving ${messageTemplateNameEnumToSave.length} messageTemplateNameEnums`,
    )
  }
  connection.destroy()
}
