import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'user' })
export class UserCounter {
  @Prop()
  key: string;

  @Prop()
  count: number;
}
export type UserCounterDocument = HydratedDocument<UserCounter>;

export const UserCounterSchema = SchemaFactory.createForClass(UserCounter);
