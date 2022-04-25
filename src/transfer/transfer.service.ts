import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferRepository } from './transfer.repository';

@Injectable()
export class TransferService implements TransferService {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly userService: UserService,
  ) {}

  async create(createTransferDto: CreateTransferDto) {
    const { funds, senderId, receiverId, currency } = createTransferDto;
    await this.userService.transfer(funds, senderId, receiverId, currency);
    return this.transferRepository.createTransfer(
      funds,
      senderId,
      receiverId,
      currency,
    );
  }

  findAll() {
    return this.transferRepository.find();
  }

  findByReceiverId(receiverId: string, startDate?: Date, endDate?: Date) {
    return this.transferRepository.findByReceiverId(
      receiverId,
      startDate,
      endDate,
    );
  }
  findBySenderId(senderId: string, startDate?: Date, endDate?: Date) {
    return this.transferRepository.findBySenderId(senderId, startDate, endDate);
  }
}
