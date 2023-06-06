import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class User {
  @Prop()
  nickname: string;

  @Prop()
  partnerId: Types.ObjectId;

}
export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
