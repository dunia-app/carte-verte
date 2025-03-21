import { Global, Module } from '@nestjs/common'
import { BankAccountManager } from './bank-account-manager'

@Global()
@Module({
  imports: [],
  providers: [BankAccountManager],
  exports: [BankAccountManager],
})
export class BankAccountManagerModule {}
