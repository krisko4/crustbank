import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Currency } from '../../user/enums/currency';
import { User } from '../../user/schemas/user.schema';

export type TransferDocument = Transfer & Document;
@Schema()
export class Transfer {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: string;
  @Prop({ default: new Date() })
  date: Date;
  @Prop({ min: 0, default: 0 })
  value: number;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  sender: string;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User.name,
  })
  receiver: string;
  @Prop({ required: true, enum: Currency })
  currency: Currency;
}

export const TransferSchema = SchemaFactory.createForClass(Transfer);
