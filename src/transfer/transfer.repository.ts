import { InjectModel } from '@nestjs/mongoose';
import { IRepository } from '../database/repository';
import { Transfer, TransferDocument } from './schemas/transfer.schema';
import { Model, Types } from 'mongoose';
import { Currency } from 'src/user/enums/currency';
import { endOfDay, startOfDay } from 'date-fns';

export class TransferRepository extends IRepository<TransferDocument> {
  constructor(
    @InjectModel(Transfer.name)
    private readonly transferModel: Model<TransferDocument>,
  ) {
    super(transferModel);
  }
  createTransfer(value: number, from: string, to: string, currency: Currency) {
    return this.create({
      value,
      receiver: new Types.ObjectId(from),
      sender: new Types.ObjectId(to),
      currency,
    });
  }
  findByReceiverId(receiverId: string, startDate?: Date, endDate?: Date) {
    let dateQuery;
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gt: startOfDay(startDate),
          $lt: endOfDay(endDate),
        },
      };
    }
    return this.find({ receiver: receiverId, ...dateQuery });
  }
  findBySenderId(senderId: string, startDate?: Date, endDate?: Date) {
    let dateQuery;
    if (startDate && endDate) {
      dateQuery = {
        date: {
          $gt: startOfDay(startDate),
          $lt: endOfDay(endDate),
        },
      };
    }
    return this.find({ sender: senderId, ...dateQuery });
  }
}
