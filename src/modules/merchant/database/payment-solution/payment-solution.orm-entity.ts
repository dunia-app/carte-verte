import { Column, Entity } from 'typeorm'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrmEntityProps } from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('payment_solution')
export class PaymentSolutionOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<PaymentSolutionOrmEntity>) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  @Column()
  name: string
}
