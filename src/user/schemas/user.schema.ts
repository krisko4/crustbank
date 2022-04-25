import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Currency } from '../enums/currency';

export type UserDocument = User & Document;

@Schema()
export class Transaction {
  @Prop({ default: new Date() })
  date: Date;
  @Prop({ min: 0, default: 0 })
  value: number;
}

@Schema()
export class Exchange extends Transaction {
  @Prop({ required: true })
  exchangeCourse: number;
  @Prop({ required: true })
  sourceCurrency: Currency;
  @Prop({ required: true })
  targetCurrency: Currency;
}

@Schema()
export class Account {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: string;
  @Prop({ min: 0, default: 0 })
  value: number;
  @Prop()
  deposits: Transaction[];
  @Prop()
  withdrawals: Transaction[];
}

@Schema()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: string;
  @Prop()
  pln: Account;
  @Prop()
  eur: Account;
  @Prop()
  usd: Account;
  @Prop()
  exchanges: Exchange[];
}

export const UserSchema = SchemaFactory.createForClass(User);
