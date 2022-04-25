import { Test } from '@nestjs/testing';
import { FundsValidator } from './funds.validator';

describe('FundsValidator', () => {
  let validator: FundsValidator;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [FundsValidator],
    }).compile();
    validator = module.get<FundsValidator>(FundsValidator);
  });
  describe('validateFunds', () => {
    it('should throw exception if funds are negative number', () => {
      expect(() => validator.validateFunds(-100)).toThrow();
    });
    it('should throw exception if funds are equal to 0', () => {
      expect(() => validator.validateFunds(0)).toThrow();
    });
    it('should not throw exception if funds are positive number', () => {
      expect(() => validator.validateFunds(100)).not.toThrow();
    });
  });
  describe('validateAccountSufficiency', () => {
    it('should throw exception if funds are greater than account value', () => {
      expect(() => validator.validateAccountSufficiency(100, 0)).toThrow();
    });
    it('should not throw exception if funds are lower than account value', () => {
      expect(() =>
        validator.validateAccountSufficiency(100, 1000),
      ).not.toThrow();
    });
  });
});
