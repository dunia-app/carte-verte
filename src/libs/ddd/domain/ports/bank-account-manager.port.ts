import { TransferDirection } from '../../../../modules/transaction/domain/entities/transfer.types'
import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../utils/result.util'

export enum BankAccountName {
  PIVOT_ACCOUNT = 'PIVOT_ACCOUNT',
}

export interface BankAccountManagerTransfer {
  externalId: string
  amount: number
  direction: TransferDirection
  label: string
  reference: string
  iban: string
  settledAt: Date
}

export interface BankAccountManagerPort {
  getTransfer(
    bankAccountName: BankAccountName,
    direction?: TransferDirection,
    from?: Date,
    to?: Date,
  ): Promise<Result<BankAccountManagerTransfer[], ExceptionBase>>
}
