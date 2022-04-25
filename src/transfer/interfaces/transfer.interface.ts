import { CreateTransferDto } from '../dto/create-transfer.dto';
import { TransferDocument } from '../schemas/transfer.schema';

export interface TransferInterface {
  create(createTransferDto: CreateTransferDto): Promise<TransferDocument>;
  findAll(): Promise<TransferDocument[]>;
  findByReceiverId(
    receiverId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransferDocument[]>;
  findBySenderId(
    senderId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransferDocument[]>;
}
