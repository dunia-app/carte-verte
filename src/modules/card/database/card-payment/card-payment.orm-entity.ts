import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  CardPaymentStatus,
  cardPaymentStatusEnumName,
} from '../../domain/entities/card-payment.types'
import { CardOrmEntity } from '../card/card.orm-entity'

@Entity('card_payment')
export class CardPaymentOrmEntity extends TypeormEntityBase {
  constructor(props?: CardPaymentOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  cardId!: string

  @Column('varchar')
  externalPaymentId!: string

  @Column({ type: 'decimal' })
  price!: number

  @Column({
    type: 'enum',
    enum: CardPaymentStatus,
    enumName: cardPaymentStatusEnumName,
  })
  status!: CardPaymentStatus

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => CardOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cardId' })
  private _card!: never
}
