import { Currency } from 'src/user/enums/currency';

export class CreateTransferDto {
  funds: number;
  senderId: string;
  receiverId: string;
  currency: Currency;
}
