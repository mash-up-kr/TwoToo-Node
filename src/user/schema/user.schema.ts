import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class User {
  @Prop()
  userNo: number;

  @Prop()
  nickname: string;

  @Prop()
  partnerNo: number;
}
export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
