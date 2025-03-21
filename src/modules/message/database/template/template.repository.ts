import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsOrder, Repository } from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { objectArrayToObjectArrayKey } from '../../../../helpers/object.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  TemplateEntity,
  TemplateProps,
} from '../../../../modules/message/domain/entities/template.entity'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { TemplateOrmEntity } from './template.orm-entity'
import { TemplateOrmMapper } from './template.orm-mapper'
import { TemplateMap, TemplateRepositoryPort } from './template.repository.port'

@Injectable()
export class TemplateRepository
  extends TypeormRepositoryBase<
    TemplateEntity,
    TemplateProps,
    TemplateOrmEntity
  >
  implements TemplateRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(TemplateOrmEntity)
    private readonly templateRepository: Repository<TemplateOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      templateRepository,
      new TemplateOrmMapper(TemplateEntity, TemplateOrmEntity, config),
      logger,
    )
  }

  private async findOneByTemplateName(
    templateName: MessageTemplateName,
  ): Promise<TemplateOrmEntity | null> {
    const template = await this.templateRepository.findOne({
      where: { templateName },
    })

    return template
  }

  async findOneByTemplateNameOrThrow(
    templateName: MessageTemplateName,
  ): Promise<TemplateEntity> {
    const template = await this.findOneByTemplateName(templateName)
    if (!template) {
      throw new NotFoundException(
        `Template with templateName '${templateName}' not found`,
      )
    }
    return this.mapper.toDomainEntity(template)
  }

  async exists(templateName: MessageTemplateName): Promise<boolean> {
    const found = await this.findOneByTemplateName(templateName)
    if (found) {
      return true
    }
    return false
  }

  async getTemplateMap(): Promise<TemplateMap> {
    const templates = await this.findMany()
    return objectArrayToObjectArrayKey(templates, 'templateName') as TemplateMap
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<TemplateProps>,
  ): FindOptionsOrder<TemplateOrmEntity> {
    const order: FindOptionsOrder<TemplateOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<TemplateProps>,
  ): WhereCondition<TemplateOrmEntity> {
    const where: WhereCondition<TemplateOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.templateName) {
      where.templateName = params.templateName
    }
    if (params.title) {
      where.title = params.title
    }
    return where
  }
}
