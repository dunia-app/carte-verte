import { Column, Entity, Unique } from 'typeorm'
import { Language, languageEnumName } from '../../../helpers/language.helper'
import { UUID } from '../../ddd/domain/value-objects/uuid.value-object'
import { OrmEntityProps } from '../../ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('error_type')
@Unique('UQ_error_type_code_language', ['code', 'language'])
export class ErrorTypeOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<ErrorTypeOrmEntity>) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }
  @Column('varchar')
  code!: string

  @Column({ type: 'varchar', nullable: true })
  description?: string

  @Column({
    default: Language.FR,
    type: 'enum',
    enum: Language,
    enumName: languageEnumName,
  })
  language!: Language

  @Column({ type: 'varchar', nullable: true })
  translatedTitle?: string

  @Column({ type: 'varchar', nullable: true })
  translatedMessage!: string
}
