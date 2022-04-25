import { CreateUserDto } from '../dto/create-user.dto';
import { Currency } from '../enums/currency';
import { Exchange, Transaction, UserDocument } from '../schemas/user.schema';

export interface UserInterface {
  withdraw(
    funds: number,
    id: string,
    currency: Currency,
  ): Promise<UserDocument>;

  deposit(funds: number, id: string, currency: Currency): Promise<UserDocument>;

  exchange(
    funds: number,
    id: string,
    sourceCurrency: Currency,
    targetCurrency: Currency,
  ): Promise<void>;

  findAll(): Promise<UserDocument[]>;
  findById(id: string): Promise<UserDocument>;
  findPLN(id: string): Promise<UserDocument>;
  findEUR(id: string): Promise<UserDocument>;
  findUSD(id: string): Promise<UserDocument>;

  transfer(
    funds: number,
    senderId: string,
    receiverId: string,
    currency: Currency,
  ): Promise<void>;

  findDeposits(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  findWithdrawals(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Transaction[]>;

  findExchanges(
    id: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Exchange[]>;

  create(createUserDto: CreateUserDto): Promise<UserDocument>;
}
