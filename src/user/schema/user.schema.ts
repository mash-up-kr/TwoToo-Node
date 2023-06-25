import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LoginType } from '../user.types';

@Schema({ collection: 'user' })
export class User {
  @Prop()
  userNo!: number;

  @Prop()
  nickname!: string;

  @Prop()
  partnerNo?: number;

  @Prop()
  socialId!: string;

  @Prop()
  loginType!: LoginType;

  @Prop()
  accessToken!: string;

  @Prop()
  firebaseToken!: string;
}
export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
