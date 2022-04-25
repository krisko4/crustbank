import { Currency } from '../../enums/currency';

export const exchangeHistoryStub = (exchangeCourse: number) => {
  return [
    {
      value: 500,
      sourceCurrency: Currency.PLN,
      targetCurrency: Currency.USD,
      exchangeCourse,
      date: new Date(2000, 7, 15),
    },
    {
      value: 500,
      sourceCurrency: Currency.PLN,
      targetCurrency: Currency.USD,
      exchangeCourse,
      date: new Date(2000, 7, 18),
    },
    {
      value: 500,
      sourceCurrency: Currency.PLN,
      targetCurrency: Currency.USD,
      exchangeCourse,
      date: new Date(2000, 7, 20),
    },
  ];
};
