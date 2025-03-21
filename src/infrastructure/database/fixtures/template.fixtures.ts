import { UUID } from '../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TemplateOrmEntity } from '../../../modules/message/database/template/template.orm-entity'
import { TemplateRepository } from '../../../modules/message/database/template/template.repository'
import { TemplateEntity } from '../../../modules/message/domain/entities/template.entity'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'
import { templates } from './templates'

export async function templatesFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const repo = new TemplateRepository(
    connection.getRepository(TemplateOrmEntity),
    config,
  )
  const templateEntities = templates.map(
    (template) =>
      new TemplateEntity({
        id: UUID.generate(),
        props: template,
      }),
  )

  const existingTemplates = await repo.findMany()
  const templateToSave = templateEntities.filter(
    (template) =>
      !existingTemplates.find(
        (existingTemplate) =>
          existingTemplate.templateName === template.templateName,
      ),
  )

  if (templateToSave.length) {
    console.log('templates fixtures pushing')
    console.time(`saving ${templateToSave.length} templates`)
    await repo.saveMultiple(templateToSave)
    console.timeEnd(`saving ${templateToSave.length} templates`)
  }
  connection.destroy()
}
