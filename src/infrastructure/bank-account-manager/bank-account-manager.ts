import { Injectable } from '@nestjs/common'
import { QuontoBankAccountManager } from '../../libs/ddd/infrastructure/bank-account-manager/quonto.bank-account-manager.base'

@Injectable()
export class BankAccountManager extends QuontoBankAccountManager {}
