import { InjectModel } from '@nestjs/mongoose';
import { IRepository } from '../database/repository';
import {
  Exchange,
  Transaction,
  User,
  UserDocument,
} from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { Currency } from './enums/currency';
import { endOfDay, startOfDay } from 'date-fns';
import { TransactionType } from './enums/transaction-type';

export class UserRepository extends IRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  private async findTransaction(
    id: string,
    currency: Currency,
    transaction: TransactionType,
    startDate?: Date,
    endDate?: Date,
  ) {
    const key = `${currency}.${transaction}`;
    let dateQuery;
    if (startDate && endDate) {
      dateQuery = {
        [`${key}.date`]: {
          $gt: startOfDay(startDate),
          $lt: endOfDay(endDate),
        },
      };
    }
    return await this.userModel.aggregate<Transaction>([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      { $unwind: `$${key}` },
      { $match: { ...dateQuery } },
      { $replaceRoot: { newRoot: `$${key}` } },
    ]);
  }

  async findExchanges(id: string, startDate?: Date, endDate?: Date) {
    let dateQuery;
    if (startDate && endDate) {
      dateQuery = {
        ['exchanges.date']: {
          $gt: startOfDay(startDate),
          $lt: endOfDay(endDate),
        },
      };
    }
    return await this.userModel.aggregate<Exchange>([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      { $unwind: '$exchanges' },
      { $match: { ...dateQuery } },
      { $replaceRoot: { newRoot: `$exchanges` } },
    ]);
  }

  async findEUR(id: string) {
    return this.findById(id, undefined, { eur: 1 });
  }
  async findPLN(id: string) {
    return this.findById(id, undefined, { pln: 1 });
  }
  async findUSD(id: string) {
    return this.findById(id, undefined, { usd: 1 });
  }

  async findDeposits(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ) {
    return await this.findTransaction(
      id,
      currency,
      TransactionType.DEPOSIT,
      startDate,
      endDate,
    );
  }

  async findWithdrawals(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ) {
    return await this.findTransaction(
      id,
      currency,
      TransactionType.WITHDRAWAL,
      startDate,
      endDate,
    );
  }

  async deposit(funds: number, id: string, currency: Currency) {
    return await this.findByIdAndUpdate(id, {
      $inc: {
        [`${currency}.value`]: funds,
      },
      $push: {
        [`${currency}.deposits`]: {
          value: funds,
          date: new Date(),
        },
      },
    });
  }
  async withdraw(funds: number, id: string, currency: Currency) {
    return await this.findByIdAndUpdate(id, {
      $inc: {
        [`${currency}.value`]: -funds,
      },
      $push: {
        [`${currency}.withdrawals`]: {
          value: funds,
          date: new Date(),
        },
      },
    });
  }
  async exchange(
    funds: number,
    id: string,
    sourceCurrency: Currency,
    targetCurrency: Currency,
    exchangeCourse: number,
  ) {
    await this.withdraw(funds, id, sourceCurrency);
    await this.deposit(funds * exchangeCourse, id, targetCurrency);
    await this.findByIdAndUpdate(id, {
      $push: {
        exchanges: {
          date: new Date(),
          exchangeCourse,
          sourceCurrency,
          targetCurrency,
          value: funds,
        },
      },
    });
  }
  async transfer(
    funds: number,
    senderId: string,
    receiverId: string,
    currency: Currency,
  ) {
    await this.withdraw(funds, senderId, currency);
    await this.deposit(funds, receiverId, currency);
  }
  createUser(pln?: number, usd?: number, eur?: number) {
    return this.create({
      pln: {
        value: pln,
      },
      eur: {
        value: eur,
      },
      usd: {
        value: usd,
      },
    });
  }
}
