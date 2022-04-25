import { Types } from 'mongoose';
export const findUserStub = () => {
  return {
    _id: new Types.ObjectId(),
  };
};
