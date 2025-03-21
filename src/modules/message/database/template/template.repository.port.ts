import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  TemplateEntity,
  TemplateProps,
} from '../../domain/entities/template.entity'
import { MessageTemplateName } from '../../domain/entities/template.types'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface TemplateRepositoryPort
  extends RepositoryPort<TemplateEntity, TemplateProps> {
  findOneByTemplateNameOrThrow(
    templateName: MessageTemplateName,
  ): Promise<TemplateEntity>
  getTemplateMap(): Promise<TemplateMap>
}

export type TemplateMap = {
  [key in MessageTemplateName]: TemplateEntity[]
}
