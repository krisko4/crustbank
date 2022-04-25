import { Types } from 'mongoose';
import { Currency } from '../../../user/enums/currency';
export const transferStub = (
  date?: Date,
  senderId?: Types.ObjectId,
  receiverId?: Types.ObjectId,
) => {
  return {
    funds: 1000,
    sender: senderId || new Types.ObjectId(),
    receiver: receiverId || new Types.ObjectId(),
    currency: Currency.PLN,
    date: date || new Date(),
  };
};
