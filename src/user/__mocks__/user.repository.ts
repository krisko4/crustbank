import { createUserStub } from '../test/stubs/create-user.stub';
import { findUserStub } from '../test/stubs/find-user.stub';

export const UserRepository = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(createUserStub(1000, 0, 0)),
  findById: jest.fn().mockResolvedValue(findUserStub()),
  transfer: jest.fn(),
});
