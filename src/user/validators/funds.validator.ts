import { Injectable } from '@nestjs/common';

@Injectable()
export class FundsValidator {
  validateFunds(funds: number) {
    if (funds <= 0) {
      throw new Error('Deposited funds should be a positive number');
    }
  }

  validateAccountSufficiency(funds: number, accountValue: number) {
    if (funds > accountValue)
      throw new Error('You have insufficient funds to perform this operation');
  }
}
