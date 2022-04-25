export const FundsValidator = jest.fn().mockReturnValue({
  validateFunds: jest.fn(),
  validateAccountSufficiency: jest.fn().mockImplementation(() => null),
});
