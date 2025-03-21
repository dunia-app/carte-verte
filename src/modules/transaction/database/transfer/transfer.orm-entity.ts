import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { WalletOrmEntity } from '../../../wallet/database/wallet/wallet.orm-entity'
import {
  TransferDirection,
  transferDirectionEnumName,
  TransferSource,
  transferSourceEnumName,
} from '../../domain/entities/transfer.types'

@Entity('transfer')
export class TransferOrmEntity extends TypeormEntityBase {
  constructor(props?: TransferOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid', { nullable: true })
  walletId?: string

  @Column({
    type: 'enum',
    enum: TransferSource,
    enumName: transferSourceEnumName,
  })
  source!: TransferSource

  @Column('varchar')
  name!: string

  @Column({ type: 'timestamptz' })
  paymentDate!: Date

  @Column({ type: 'decimal' })
  amount!: number

  @Column({
    type: 'enum',
    enum: TransferDirection,
    enumName: transferDirectionEnumName,
  })
  direction!: TransferDirection

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => WalletOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'walletId' })
  private _wallet!: never
}
