import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { Currency } from './enums/currency';
import { UserInterface } from './interfaces/user.interface';
import { UserRepository } from './user.repository';
import { FundsValidator } from './validators/funds.validator';

@Injectable()
export class UserService implements UserInterface {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fundsValidator: FundsValidator,
    private readonly configService: ConfigService,
  ) {}

  async withdraw(funds: number, id: string, currency: Currency) {
    this.fundsValidator.validateFunds(funds);
    const user = await this.findById(id);
    if (!user) throw new Error(`User with id: ${id} not found`);
    this.fundsValidator.validateAccountSufficiency(
      funds,
      user[`${currency}`].value,
    );
    return this.userRepository.withdraw(funds, user._id, currency);
  }
  async deposit(funds: number, id: string, currency: Currency) {
    this.fundsValidator.validateFunds(funds);
    const user = await this.findById(id);
    if (!user) throw new Error(`User with id: ${id} not found`);
    return this.userRepository.deposit(funds, user._id, currency);
  }

  async exchange(
    funds: number,
    id: string,
    sourceCurrency: Currency,
    targetCurrency: Currency,
  ) {
    this.fundsValidator.validateFunds(funds);
    const user = await this.findById(id);
    if (!user) throw new Error(`User with id: ${id} not found`);
    if (sourceCurrency === targetCurrency)
      throw new Error('Source and target currencies should not be the same');
    this.fundsValidator.validateAccountSufficiency(
      funds,
      user[sourceCurrency].value,
    );
    const exchangeType = `${sourceCurrency}${targetCurrency}`;
    const exchangeCourse = this.configService.get<number>(exchangeType);
    return this.userRepository.exchange(
      funds,
      id,
      sourceCurrency,
      targetCurrency,
      exchangeCourse,
    );
  }

  async transfer(
    funds: number,
    senderId: string,
    receiverId: string,
    currency: Currency,
  ) {
    this.fundsValidator.validateFunds(funds);
    const sender = await this.findById(senderId);
    if (!sender) throw new Error(`User with id: ${senderId} not found`);
    const receiver = await this.findById(receiverId);
    if (!receiver) throw new Error(`User with id: ${receiverId} not found`);
    this.fundsValidator.validateAccountSufficiency(
      funds,
      sender[`${currency}`].value,
    );
    await this.userRepository.transfer(
      funds,
      sender._id,
      receiver._id,
      currency,
    );
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findAll() {
    return this.userRepository.find();
  }
  findPLN(id: string) {
    return this.userRepository.findPLN(id);
  }
  findEUR(id: string) {
    return this.userRepository.findEUR(id);
  }
  findUSD(id: string) {
    return this.userRepository.findUSD(id);
  }

  findDeposits(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.userRepository.findDeposits(id, currency, startDate, endDate);
  }

  findWithdrawals(
    id: string,
    currency: Currency,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.userRepository.findWithdrawals(
      id,
      currency,
      startDate,
      endDate,
    );
  }

  findExchanges(id: string, startDate?: Date, endDate?: Date) {
    return this.userRepository.findExchanges(id, startDate, endDate);
  }

  create(createUserDto: CreateUserDto) {
    const { pln, eur, usd } = createUserDto;
    return this.userRepository.createUser(pln, usd, eur);
  }
}
