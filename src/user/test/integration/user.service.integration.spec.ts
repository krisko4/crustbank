import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UserRepository } from '../../user.repository';
import {
  closeDatabaseConnection,
  databaseTestModule,
} from '../../../database/database.module';
import { User, UserDocument, UserSchema } from '../../schemas/user.schema';
import { UserService } from '../../user.service';
import { Model } from 'mongoose';
import { Currency } from '../../enums/currency';
import { FundsValidator } from '../../validators/funds.validator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../../../config/configuration';
import { ExchangeType } from '../../enums/exchange-type';
import { exchangeHistoryStub } from '../stubs/exchange-history.stub';
import { transactionHistoryStub } from '../stubs/transaction-history.stub';
import { createUserStub } from '../stubs/create-user.stub';

const currencies = [Currency.EUR, Currency.PLN, Currency.USD];
describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserDocument>;
  let configService: ConfigService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        databaseTestModule(),
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UserService, UserRepository, FundsValidator],
    }).compile();

    service = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
    userModel = module.get<typeof userModel>('UserModel');
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should add new user', async () => {
    let users = await userModel.find();
    expect(users).toEqual([]);
    const newUser = await service.create({});
    users = await userModel.find();
    expect(users.toString()).toEqual([newUser].toString());
  });
  describe('Account selection', () => {
    let user: UserDocument;
    let stub: ReturnType<typeof createUserStub>;
    beforeEach(async () => {
      stub = createUserStub(500, 1000, 1500);
      user = await new userModel(stub).save();
    });
    describe('when findPLN is called', () => {
      let response: UserDocument;
      beforeEach(async () => {
        response = await service.findPLN(user._id);
      });
      it('should return pln account', () => {
        expect(response.pln.value).toEqual(stub.pln.value);
      });
    });
    describe('when findEUR is called', () => {
      let response: UserDocument;
      beforeEach(async () => {
        response = await service.findEUR(user._id);
      });
      it('should return eur account', () => {
        expect(response.eur.value).toEqual(stub.eur.value);
      });
    });
    describe('when findUSD is called', () => {
      let response: UserDocument;
      beforeEach(async () => {
        response = await service.findUSD(user._id);
      });
      it('should return pln account', () => {
        expect(response.usd.value).toEqual(stub.usd.value);
      });
    });
  });
  describe('Exchange history', () => {
    let history;
    beforeEach(() => {
      history = exchangeHistoryStub(configService.get(ExchangeType.EURPLN));
    });
    describe('When exchanges are queried', () => {
      let user: UserDocument;
      beforeEach(async () => {
        user = await new userModel({
          exchanges: history,
        }).save();
      });
      it('should find all exchanges', async () => {
        const foundExchanges = await service.findExchanges(user._id);
        expect(foundExchanges).toMatchObject(history);
      });
      it('should find exchanges between given dates', async () => {
        const foundExchanges = await service.findExchanges(
          user._id,
          new Date(2000, 7, 16),
          new Date(2000, 7, 19),
        );
        expect(foundExchanges).toMatchObject([history[1]]);
      });
    });
  });
  describe.each(currencies)('Currency: %s', (currency) => {
    describe('Transaction history', () => {
      let history;
      beforeEach(() => {
        history = transactionHistoryStub();
      });
      describe('When deposits are queried', () => {
        let user: UserDocument;
        beforeEach(async () => {
          user = await new userModel({
            [currency]: {
              value: 1500,
              deposits: history,
            },
          }).save();
        });
        it('should find all deposits', async () => {
          const foundDeposits = await service.findDeposits(user._id, currency);
          expect(foundDeposits).toMatchObject(history);
        });
        it('should find deposits between given dates', async () => {
          const foundDeposits = await service.findDeposits(
            user._id,
            currency,
            new Date(2000, 7, 16),
            new Date(2000, 7, 19),
          );
          expect(foundDeposits).toMatchObject([history[1]]);
        });
      });
      describe('When withdrawals are queried', () => {
        let user: UserDocument;
        beforeEach(async () => {
          user = await new userModel({
            [currency]: {
              value: 1500,
              withdrawals: history,
            },
          }).save();
        });
        it('should find all withdrawals', async () => {
          const foundWithdrawals = await service.findWithdrawals(
            user._id,
            currency,
          );
          expect(foundWithdrawals).toMatchObject(history);
        });
        it('should find withdrawals between given dates', async () => {
          const foundWithdrawals = await service.findWithdrawals(
            user._id,
            currency,
            new Date(2000, 7, 16),
            new Date(2000, 7, 19),
          );
          expect(foundWithdrawals).toMatchObject([history[1]]);
        });
      });
    });
    describe('Transfer between accounts', () => {
      let sender: UserDocument;
      let receiver: UserDocument;
      let transferredValue: number;
      beforeEach(async () => {
        transferredValue = 500;
        sender = await new userModel({
          [currency]: {
            value: 1000,
          },
        }).save();
        receiver = await new userModel({
          [currency]: {
            value: 0,
          },
        }).save();
      });
      it('should throw exception if senderId and receiverId are equal', () => {
        expect(
          service.transfer(
            transferredValue,
            'NON_EXISTENT_SENDER_ID',
            sender._id,
            sender._id,
          ),
        ).rejects.toThrowError();
      });
      it('should throw exception if sender has not been found', () => {
        expect(
          service.transfer(
            transferredValue,
            'NON_EXISTENT_SENDER_ID',
            receiver._id,
            currency,
          ),
        ).rejects.toThrowError();
      });
      it('should throw exception if receiver has not been found', () => {
        expect(
          service.transfer(
            transferredValue,
            sender._id,
            'NON_EXISTENT_RECEIVER_ID',
            currency,
          ),
        ).rejects.toThrowError();
      });
      it('should throw exception if funds are negative', () => {
        expect(
          service.transfer(
            -transferredValue,
            sender._id,
            receiver._id,
            currency,
          ),
        ).rejects.toThrowError();
      });
      it('should throw exception if sender has insufficient funds', () => {
        expect(
          service.transfer(1100, sender._id, receiver._id, Currency.PLN),
        ).rejects.toThrowError();
      });
      it('should transfer funds from one user to another', async () => {
        await service.transfer(
          transferredValue,
          sender._id,
          receiver._id,
          currency,
        );
        sender = await userModel.findById(sender._id);
        receiver = await userModel.findById(receiver._id);
        expect(sender[currency].value).toEqual(transferredValue);
        expect(receiver[currency].value).toEqual(transferredValue);
      });
    });
    describe('Account operations', () => {
      let user: UserDocument;
      let updatedUser: UserDocument;
      beforeEach(async () => {
        user = await new userModel({
          [currency]: {
            value: 1000,
          },
        }).save();
      });
      it('should throw exception if funds are negative', () => {
        expect(
          service.deposit(-500, user._id, currency),
        ).rejects.toThrowError();
      });
      it('should throw exception if user has not been found', () => {
        expect(
          service.deposit(-500, 'NON_EXISTENT_USER_ID', currency),
        ).rejects.toThrowError();
      });
      describe('Currency exchange', () => {
        const sourceCurrency = currency;
        const otherCurrencies = currencies.filter((curr) => curr !== currency);
        describe.each(otherCurrencies)(
          `${sourceCurrency} to %s`,
          (otherCurrency) => {
            const targetCurrency = otherCurrency;
            it('should throw exception if source and target currencies are the same', () => {
              expect(
                service.exchange(
                  1100,
                  user._id,
                  sourceCurrency,
                  sourceCurrency,
                ),
              ).rejects.toThrowError();
            });
            it('should throw exception if user has insufficient funds for exchange', () => {
              expect(
                service.exchange(
                  1100,
                  user._id,
                  sourceCurrency,
                  sourceCurrency,
                ),
              ).rejects.toThrowError();
            });
            describe('When user exchanges currency', () => {
              let exchangedFunds: number;
              let exchangeCourse: number;
              beforeEach(async () => {
                exchangedFunds = 500;
                const exchangeType = `${sourceCurrency}${targetCurrency}`;
                exchangeCourse = configService.get<number>(exchangeType);
                await service.exchange(
                  exchangedFunds,
                  user._id,
                  sourceCurrency,
                  targetCurrency,
                );
                updatedUser = await userModel.findById(user._id);
              });
              it('should update user account', async () => {
                const targetValue = updatedUser[targetCurrency].value;
                const sourceValue = updatedUser[sourceCurrency].value;
                const expectedValue = exchangedFunds * exchangeCourse;
                expect(targetValue).toEqual(expectedValue);
                expect(sourceValue).toEqual(
                  user[sourceCurrency].value - exchangedFunds,
                );
              });
              it('should add exchange to history', () => {
                const { exchanges } = updatedUser;
                expect(exchanges).toHaveLength(1);
                const exchange = exchanges[0];
                expect(exchange.exchangeCourse).toEqual(exchangeCourse);
                expect(exchange.sourceCurrency).toEqual(sourceCurrency);
                expect(exchange.targetCurrency).toEqual(targetCurrency);
                expect(exchange.value).toEqual(exchangedFunds);
              });
            });
          },
        );
      });
      describe('Deposit', () => {
        describe('When user deposits funds', () => {
          let depositedFunds: number;
          beforeEach(async () => {
            depositedFunds = 1000;
            await service.deposit(depositedFunds, user._id, currency);
            updatedUser = await userModel.findById(user._id);
          });
          it('should update user account', async () => {
            expect(updatedUser[currency].value).toEqual(
              depositedFunds + user[currency].value,
            );
          });
          it('should add deposit to history', async () => {
            const { deposits } = updatedUser[currency];
            expect(deposits).toHaveLength(1);
            const deposit = deposits[0];
            expect(deposit.value).toEqual(depositedFunds);
          });
        });
      });
      describe('Withdrawal', () => {
        it('should throw exception if user has insufficient funds', () => {
          expect(
            service.withdraw(1100, user._id, currency),
          ).rejects.toThrowError();
        });
        describe('When user withdraws funds', () => {
          let withdrawnFunds: number;
          beforeEach(async () => {
            withdrawnFunds = 500;
            await service.withdraw(withdrawnFunds, user._id, currency);
            updatedUser = await userModel.findById(user._id);
          });
          it('should update user account', async () => {
            expect(updatedUser[currency].value).toEqual(withdrawnFunds);
          });
          it('should add withdrawal to history', async () => {
            const withdrawals = updatedUser[currency].withdrawals;
            expect(withdrawals).toHaveLength(1);
            const withdrawal = withdrawals[0];
            expect(withdrawal.value).toEqual(withdrawnFunds);
          });
        });
      });
    });
  });
});
