export const UserService = jest.fn().mockReturnValue({
  transfer: jest.fn().mockResolvedValue(null),
});
