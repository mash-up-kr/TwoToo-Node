import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class NotificationCounter {
  @Prop()
  key!: string;

  @Prop()
  count!: number;
}
export type NotificationCounterDocument = NotificationCounter & Document;

export const NotificationCounterSchema = SchemaFactory.createForClass(NotificationCounter);
