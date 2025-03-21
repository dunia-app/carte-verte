import { Column, Entity, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('webhook')
@Unique('UQ_webhook_source_external_id', ['source', 'externalId'])
export class WebhookOrmEntity extends TypeormEntityBase {
  constructor(props?: WebhookOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column({ type: 'varchar' })
  source!: string

  @Column({ type: 'varchar' })
  externalId!: string

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  externalCreatedAt!: Date

  @Column({ type: 'jsonb' })
  event: any

  @Column({ type: 'timestamptz', nullable: true })
  handledAt?: Date

  @Column({ type: 'boolean', nullable: true })
  handlerResponse?: boolean
}
