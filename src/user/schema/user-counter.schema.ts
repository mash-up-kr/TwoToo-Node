import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class UserCounter {
  @Prop()
  key!: string;

  @Prop()
  count!: number;
}
export type UserCounterDocument = UserCounter & Document;

export const UserCounterSchema = SchemaFactory.createForClass(UserCounter);
